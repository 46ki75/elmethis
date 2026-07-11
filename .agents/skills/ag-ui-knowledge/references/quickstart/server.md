# Quickstart: Server implementation

Source: `submodules/ag-ui/docs/quickstart/server.mdx`

How to build a **native AG-UI server** that emits events directly. Open this
file when implementing the agent endpoint from scratch (no existing framework
to adapt), especially in Python/FastAPI.

## When to use this path

Pick a server implementation when you want:

- A **new agent built from scratch** (no existing framework to wrap).
- **Maximum control** over which events are emitted and when.
- A **standalone API** exposing your agent.

For wrapping an existing agent framework or in-process orchestrator, use the
middleware path instead (`quickstart/middleware.md`). For building the
consuming UI, use `quickstart/client.md`.

## What the contract is

An AG-UI server accepts:

- `POST /` with body `RunAgentInput` (JSON).
- `Accept: text/event-stream` for SSE (or the binary content-type if
  supported).

And returns a stream of AG-UI events:

- Lifecycle: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`.
- Content: `TEXT_MESSAGE_*`, `TOOL_CALL_*`, `STATE_*`, `REASONING_*`, and so on.

## Minimum viable server (Python / FastAPI)

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from ag_ui.core import RunAgentInput, EventType, RunStartedEvent
from ag_ui.encoder import EventEncoder
import uuid

app = FastAPI(title="AG-UI Endpoint")

@app.post("/")
async def agentic_chat_endpoint(input_data: RunAgentInput, request: Request):
    accept_header = request.headers.get("accept")
    encoder = EventEncoder(accept=accept_header)

    async def event_generator():
        yield encoder.encode(
            RunStartedEvent(
                type=EventType.RUN_STARTED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
            )
        )
        # ... (emit more events)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

`EventEncoder` formats events as SSE (`data: {json}\n\n` per event) by default.

## Full streaming chat with OpenAI

This is the canonical end-to-end example: accept `RunAgentInput`, call OpenAI
with streaming, forward each chunk as an AG-UI event, terminate with
`RUN_FINISHED` (or `RUN_ERROR` on exception).

```python
import os, uuid, uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from ag_ui.core import (
    RunAgentInput, EventType,
    RunStartedEvent, RunFinishedEvent, RunErrorEvent,
    TextMessageChunkEvent, ToolCallChunkEvent,
)
from ag_ui.encoder import EventEncoder
from openai import OpenAI

app = FastAPI(title="AG-UI OpenAI Server")
client = OpenAI()  # uses OPENAI_API_KEY

@app.post("/")
async def agentic_chat_endpoint(input_data: RunAgentInput, request: Request):
    accept_header = request.headers.get("accept")
    encoder = EventEncoder(accept=accept_header)

    async def event_generator():
        try:
            yield encoder.encode(RunStartedEvent(
                type=EventType.RUN_STARTED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
            ))

            stream = client.chat.completions.create(
                model="gpt-4o",
                stream=True,
                tools=[
                    {"type": "function", "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.parameters,
                    }} for tool in input_data.tools
                ] if input_data.tools else None,
                messages=[
                    {
                        "role": message.role,
                        "content": message.content or "",
                        **({"tool_calls": message.tool_calls}
                           if message.role == "assistant" and getattr(message, "tool_calls", None) else {}),
                        **({"tool_call_id": message.tool_call_id}
                           if message.role == "tool" and getattr(message, "tool_call_id", None) else {}),
                    }
                    for message in input_data.messages
                ],
            )

            message_id = str(uuid.uuid4())

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield encoder.encode(TextMessageChunkEvent(
                        type=EventType.TEXT_MESSAGE_CHUNK,
                        message_id=message_id,
                        delta=delta.content,
                    ))
                elif delta.tool_calls:
                    tc = delta.tool_calls[0]
                    yield encoder.encode(ToolCallChunkEvent(
                        type=EventType.TOOL_CALL_CHUNK,
                        tool_call_id=tc.id,
                        tool_call_name=tc.function.name if tc.function else None,
                        parent_message_id=message_id,
                        delta=tc.function.arguments if tc.function else None,
                    ))

            yield encoder.encode(RunFinishedEvent(
                type=EventType.RUN_FINISHED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
            ))

        except Exception as error:
            yield encoder.encode(RunErrorEvent(
                type=EventType.RUN_ERROR,
                message=str(error),
            ))

    return StreamingResponse(event_generator(), media_type=encoder.get_content_type())

def main():
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("example_server:app", host="0.0.0.0", port=port, reload=True)

if __name__ == "__main__":
    main()
```

### What's happening

1. **Setup** — create the OpenAI client, emit `RUN_STARTED`.
2. **Request** — convert AG-UI tools/messages to OpenAI shapes; call
   `chat.completions` with `stream=True`.
3. **Streaming** — forward each chunk as `TEXT_MESSAGE_CHUNK` or
   `TOOL_CALL_CHUNK`. Chunks auto-open/close their triads.
4. **Finish** — emit `RUN_FINISHED` on success, `RUN_ERROR` on exception.

## Smoke-test with curl

```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "threadId": "thread_123",
    "runId": "run_456",
    "state": {},
    "messages": [{ "id": "msg_1", "role": "user", "content": "Hello, how are you?" }],
    "tools": [],
    "context": [],
    "forwardedProps": {}
  }'
```

You should see SSE events streamed back, terminated by `RUN_FINISHED`.

## Extending the server

- **Tools** — keep the `tool_calls` branch and add a `tool` role-message
  handler in your conversion code. The client returns tool results as
  `tool`-role messages in subsequent `RunAgentInput.messages`.
- **State** — emit `STATE_SNAPSHOT` at the start and `STATE_DELTA` (RFC 6902
  patches) as your agent updates internal state. See `concepts/state.md`.
- **Interrupts** — emit `STATE_SNAPSHOT` + `MESSAGES_SNAPSHOT` then
  `RUN_FINISHED { outcome: { type: "interrupt", interrupts: [...] } }`. See
  `concepts/interrupts.md`.
- **Reasoning** — wrap chain-of-thought summaries with `REASONING_*` events;
  attach encrypted detail with `REASONING_ENCRYPTED_VALUE`. See
  `concepts/reasoning.md`.

## Tips

- Use `*_CHUNK` events for the simplest streaming code — they collapse the
  Start/Content/End triad into one event type.
- Always wrap your generator in a `try/except` and emit `RUN_ERROR` on
  failure; the client treats a closed stream without a terminal event as a
  protocol violation.
- Set the response `media_type` from `encoder.get_content_type()` so the
  binary protocol path works too.
- For deployment, return `StreamingResponse` (FastAPI) or your framework's
  equivalent so the connection stays open and chunks flush as emitted.

## See also

- `concepts/events.md` — full event reference
- `concepts/state.md` — snapshot/delta mechanics
- `concepts/interrupts.md` — pausing the run for the user
- `references/sdks/python.md` — `ag_ui.core` and `ag_ui.encoder` reference
