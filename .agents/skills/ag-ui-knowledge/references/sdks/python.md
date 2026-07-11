# Python SDK

Source: `submodules/ag-ui/docs/sdk/python/**`

The first-party Python package `ag-ui-protocol`. Open this file for
`ag_ui.core` (types and events), `ag_ui.encoder.EventEncoder`, and
FastAPI/SSE server patterns.

## Install

```bash
pip install ag-ui-protocol
```

Or with Poetry:

```bash
poetry add ag-ui-protocol
```

## `ag_ui.core`

Strongly-typed Pydantic models for the protocol.

```python
from ag_ui.core import (
    RunAgentInput,
    EventType,
    BaseEvent,
    RunStartedEvent, RunFinishedEvent, RunErrorEvent,
    StepStartedEvent, StepFinishedEvent,
    TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent, TextMessageChunkEvent,
    ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent, ToolCallResultEvent, ToolCallChunkEvent,
    StateSnapshotEvent, StateDeltaEvent, MessagesSnapshotEvent,
    ActivitySnapshotEvent, ActivityDeltaEvent,
    ReasoningStartEvent, ReasoningMessageStartEvent, ReasoningMessageContentEvent,
    ReasoningMessageEndEvent, ReasoningMessageChunkEvent, ReasoningEndEvent,
    ReasoningEncryptedValueEvent,
    RawEvent, CustomEvent,
)
```

### Core data structures

| Type | Purpose |
| --- | --- |
| `RunAgentInput` | The POST body: `thread_id`, `run_id`, `messages`, `tools`, `state`, `context`, `forwarded_props`, optional `resume` for interrupts |
| `Message` (union: User/Assistant/System/Tool/Activity/Developer/Reasoning) | Conversation history |
| `Context` | Contextual information attached to a run |
| `Tool` | Frontend-defined tool with name, description, JSON-Schema parameters |
| `State` | Arbitrary JSON state object |

All events inherit from `BaseEvent { type: EventType, timestamp?, raw_event? }`.

### Field name convention

Python uses `snake_case` (`thread_id`, `run_id`, `message_id`, `tool_call_id`,
`parent_message_id`), serialized to `camelCase` on the wire (`threadId`,
`runId`, `messageId`, `toolCallId`, `parentMessageId`) via Pydantic's alias
generators. The wire format matches the TypeScript SDK exactly.

## `ag_ui.encoder.EventEncoder`

Encodes events as Server-Sent Events (SSE) by default.

```python
from ag_ui.core import TextMessageContentEvent, EventType
from ag_ui.encoder import EventEncoder

encoder = EventEncoder()  # or EventEncoder(accept="application/x-ag-ui-binary") for binary

event = TextMessageContentEvent(
    type=EventType.TEXT_MESSAGE_CONTENT,
    message_id="msg_123",
    delta="Hello, world!",
)

encoded = encoder.encode(event)
print(encoded)
# data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"msg_123","delta":"Hello, world!"}\n\n
```

### Methods

| Method | Purpose |
| --- | --- |
| `__init__(accept: Optional[str] = None)` | Construct with the client's `Accept` header |
| `encode(event: BaseEvent) -> str` | Format an event for transmission |
| `get_content_type() -> str` | Use when setting `media_type` on a `StreamingResponse` |

SSE wire format: `data: {json}\n\n` per event. Clients consume via the
`EventSource` API or any SSE library.

## FastAPI server pattern

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from ag_ui.core import RunAgentInput, EventType, RunStartedEvent, RunFinishedEvent
from ag_ui.encoder import EventEncoder

app = FastAPI(title="AG-UI Endpoint")

@app.post("/")
async def endpoint(input_data: RunAgentInput, request: Request):
    encoder = EventEncoder(accept=request.headers.get("accept"))

    async def event_generator():
        yield encoder.encode(RunStartedEvent(
            type=EventType.RUN_STARTED,
            thread_id=input_data.thread_id,
            run_id=input_data.run_id,
        ))
        # ... stream content events ...
        yield encoder.encode(RunFinishedEvent(
            type=EventType.RUN_FINISHED,
            thread_id=input_data.thread_id,
            run_id=input_data.run_id,
        ))

    return StreamingResponse(event_generator(), media_type=encoder.get_content_type())
```

Always:

- Set `media_type=encoder.get_content_type()` so the binary path works.
- Wrap your generator in `try/except` and emit `RunErrorEvent` on failure.
- Use `*_CHUNK` events when possible — they're the shortest correct way to
  stream text/tool calls.

See `quickstart/server.md` for a full OpenAI integration.

## Multimodal input (Python)

`UserMessage.content` can be a plain string or a list of `InputContent`
items:

```python
from ag_ui.core import UserMessage, TextInputContent, ImageInputContent, InputContentUrlSource

msg = UserMessage(
    id="msg_1",
    role="user",
    content=[
        TextInputContent(type="text", text="What's in this image?"),
        ImageInputContent(
            type="image",
            source=InputContentUrlSource(type="url", value="https://example.com/cat.jpg"),
        ),
    ],
)
```

Supported types: `text`, `image`, `audio`, `video`, `document`. Each non-text
type has a `source` that's either `{type: "data", value, mimeType}` (inline)
or `{type: "url", value, mimeType?}`. The older `BinaryInputContent` is
deprecated but kept temporarily for compatibility.

## State events

```python
from ag_ui.core import StateSnapshotEvent, StateDeltaEvent, EventType

# Replace entire state
yield encoder.encode(StateSnapshotEvent(
    type=EventType.STATE_SNAPSHOT,
    snapshot={"counter": 0, "items": []},
))

# Apply RFC 6902 JSON Patch
yield encoder.encode(StateDeltaEvent(
    type=EventType.STATE_DELTA,
    delta=[
        {"op": "replace", "path": "/counter", "value": 1},
        {"op": "add",     "path": "/items/-", "value": "new item"},
    ],
))
```

See `concepts/state.md` for snapshot/delta semantics.

## Interrupts

Emit state and messages snapshots, then `RunFinishedEvent` with an interrupt
outcome:

```python
from ag_ui.core import RunFinishedEvent, EventType

yield encoder.encode(StateSnapshotEvent(type=EventType.STATE_SNAPSHOT, snapshot=...))
yield encoder.encode(MessagesSnapshotEvent(type=EventType.MESSAGES_SNAPSHOT, messages=...))

yield encoder.encode(RunFinishedEvent(
    type=EventType.RUN_FINISHED,
    thread_id=input_data.thread_id,
    run_id=input_data.run_id,
    outcome={
        "type": "interrupt",
        "interrupts": [{
            "id": "int-1",
            "reason": "tool_call",
            "message": "Approve sending email?",
            "toolCallId": "tc-1",
            "responseSchema": {
                "type": "object",
                "properties": {"approved": {"type": "boolean"}},
                "required": ["approved"],
            },
        }],
    },
))
```

The next `RunAgentInput.resume` array brings you back. See
`concepts/interrupts.md`.

## See also

- `quickstart/server.md` — full FastAPI + OpenAI example
- `concepts/events.md` — every event type and its fields
- `concepts/state.md` — snapshot/delta mechanics
- `concepts/interrupts.md` — interrupt outcomes and resume contracts
