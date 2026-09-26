import assert from "node:assert/strict";
import { test } from "node:test";
import { Subject, lastValueFrom, toArray } from "rxjs";
import { EventType, type RunAgentInput } from "@ag-ui/core";
import { CodexAgentAdapter } from "./codex-agent.ts";
import type { CodexConnection, CodexMessage } from "./codex-rpc.ts";
import { emitDynamicBatch, startNativeTurn } from "./fixtures/codex-events.ts";

const input = (overrides: Partial<RunAgentInput> = {}): RunAgentInput => ({
  threadId: "ui-thread",
  runId: "run-1",
  messages: [{ id: "user-1", role: "user", content: "Hello" }],
  tools: [],
  context: [],
  state: {},
  forwardedProps: {},
  ...overrides,
});

class FakeConnection implements CodexConnection {
  events = new Subject<CodexMessage>();
  requests: { method: string; params: unknown }[] = [];
  closed = false;
  account: unknown = { type: "chatgpt" };
  onTurn = () => {
    this.events.next({
      method: "item/started",
      params: { item: { type: "agentMessage", id: "msg-1", text: "" } },
    });
    this.events.next({
      method: "item/agentMessage/delta",
      params: { itemId: "msg-1", delta: "Hello!" },
    });
    this.events.next({
      method: "item/completed",
      params: { item: { type: "agentMessage", id: "msg-1", text: "Hello!" } },
    });
    this.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  };
  request(method: string, params: unknown): Promise<unknown> {
    this.requests.push({ method, params });
    if (method === "account/read") {
      return Promise.resolve({ account: this.account });
    }
    if (method === "thread/start") {
      return Promise.resolve({ thread: { id: "codex-thread" } });
    }
    if (method === "turn/start") {
      queueMicrotask(() => {
        startNativeTurn(this.events);
        this.onTurn();
      });
    }
    return Promise.resolve({});
  }
  notify(method: string, params: unknown) {
    this.requests.push({ method, params });
  }
  respond() {}
  close() {
    this.closed = true;
  }
}

const agentFor = (connection: FakeConnection) =>
  new CodexAgentAdapter({
    agentId: "default",
    model: "test-model",
    connectionFactory: () => connection,
  });

void test("streams text with balanced lifecycle events and closes the process", async () => {
  const connection = new FakeConnection();
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [
      EventType.RUN_STARTED,
      EventType.STATE_SNAPSHOT,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.RUN_FINISHED,
    ],
  );
  assert.equal(connection.closed, true);
  const params = connection.requests.find(
    (request) => request.method === "thread/start",
  )?.params;
  assert.ok(params && typeof params === "object");
  assert.equal(Reflect.get(params, "model"), "test-model");
  assert.equal(Reflect.get(params, "ephemeral"), true);
  assert.equal(Reflect.get(params, "approvalPolicy"), "never");
});

for (const account of [null, { type: "apiKey" }]) {
  void test(`rejects non-subscription authentication: ${JSON.stringify(account)}`, async () => {
    const connection = new FakeConnection();
    connection.account = account;
    const events = await lastValueFrom(
      agentFor(connection).run(input()).pipe(toArray()),
    );
    assert.deepEqual(
      events.map((event) => event.type),
      [EventType.RUN_STARTED, EventType.RUN_ERROR],
    );
    assert.equal(
      connection.requests.some((request) => request.method === "thread/start"),
      false,
    );
    assert.equal(connection.closed, true);
  });
}

void test("aliases distinct malformed-Unicode frontend names without forwarding them", async () => {
  const connection = new FakeConnection();
  const events = await lastValueFrom(
    agentFor(connection)
      .run(
        input({
          tools: ["\ud800", "\ud801"].map((name) => ({
            name,
            description: "Browser tool",
            parameters: { type: "object", properties: {} },
          })),
        }),
      )
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
  const params = connection.requests.find(
    (request) => request.method === "thread/start",
  )?.params;
  assert.ok(params && typeof params === "object");
  const dynamicTools = Reflect.get(params, "dynamicTools") as unknown[];
  const namespace = dynamicTools.find(
    (tool) =>
      typeof tool === "object" &&
      tool !== null &&
      Reflect.get(tool, "type") === "namespace",
  );
  assert.ok(namespace && typeof namespace === "object");
  const tools = Reflect.get(namespace, "tools") as Array<{
    name: string;
    description: string;
  }>;
  assert.equal(new Set(tools.map((tool) => tool.name)).size, 2);
  assert.equal(
    tools.every(
      (tool) => tool.name.isWellFormed() && tool.description.isWellFormed(),
    ),
    true,
  );
});

void test("hands a dynamic tool to the frontend and replays its result on a cloned agent", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () =>
    emitDynamicBatch(connection.events, [
      {
        id: 42,
        callId: "call-1",
        namespace: "elmethis_frontend",
        tool: "weather",
        arguments: { city: "Tokyo" },
      },
    ]);
  const agent = agentFor(connection);
  const tools = [
    {
      name: "weather",
      description: "Weather",
      parameters: { type: "object", properties: { city: { type: "string" } } },
    },
  ];
  const events = await lastValueFrom(
    agent.run(input({ tools })).pipe(toArray()),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [
      EventType.RUN_STARTED,
      EventType.STATE_SNAPSHOT,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_END,
      EventType.RUN_FINISHED,
    ],
  );
  assert.equal(connection.closed, true);
  connection.closed = false;
  connection.requests = [];
  connection.onTurn = () =>
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  const followup = input({
    tools,
    runId: "run-2",
    messages: [
      ...input().messages,
      {
        id: "assistant-1",
        role: "assistant",
        toolCalls: [
          {
            id: "call-1",
            type: "function",
            function: { name: "weather", arguments: '{"city":"Tokyo"}' },
          },
        ],
      },
      { id: "tool-1", role: "tool", toolCallId: "call-1", content: "Sunny" },
    ],
  });
  await lastValueFrom(agent.clone().run(followup).pipe(toArray()));
  const history = connection.requests.find(
    (request) => request.method === "thread/inject_items",
  )?.params;
  assert.ok(history && typeof history === "object");
  assert.deepEqual(Reflect.get(history, "items"), [
    {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "Hello" }],
    },
    {
      type: "function_call",
      call_id: "call-1",
      name: "weather",
      namespace: "elmethis_frontend",
      arguments: '{"city":"Tokyo"}',
    },
    { type: "function_call_output", call_id: "call-1", output: "Sunny" },
  ]);
});

void test("history retains tool origin across registry changes and backend name collisions", async () => {
  const connection = new FakeConnection();
  await lastValueFrom(
    agentFor(connection)
      .run(
        input({
          tools: [
            {
              name: "weather",
              description: "Frontend weather",
              parameters: {},
            },
          ],
          messages: [
            {
              id: "assistant",
              role: "assistant",
              toolCalls: [
                {
                  id: "removed",
                  type: "function",
                  function: { name: "removed_frontend", arguments: "{}" },
                  metadata: { elmethisCodexTool: "frontend" },
                },
                {
                  id: "backend",
                  type: "function",
                  function: { name: "weather", arguments: "{}" },
                  metadata: { elmethisCodexTool: "backend" },
                },
                {
                  id: "legacy",
                  type: "function",
                  function: { name: "weather", arguments: "{}" },
                },
              ],
            },
            ...["removed", "backend", "legacy"].map((toolCallId) => ({
              id: `result-${toolCallId}`,
              role: "tool" as const,
              toolCallId,
              content: "Done",
            })),
          ],
        }),
      )
      .pipe(toArray()),
  );
  const history = connection.requests.find(
    (request) => request.method === "thread/inject_items",
  )?.params;
  assert.ok(history && typeof history === "object");
  const items: unknown = Reflect.get(history, "items");
  assert.ok(Array.isArray(items));
  assert.deepEqual(items.slice(0, 3), [
    {
      type: "function_call",
      call_id: "removed",
      name: "removed_frontend",
      namespace: "elmethis_frontend",
      arguments: "{}",
    },
    {
      type: "function_call",
      call_id: "backend",
      name: "weather",
      arguments: "{}",
    },
    {
      type: "function_call",
      call_id: "legacy",
      name: "weather",
      namespace: "elmethis_frontend",
      arguments: "{}",
    },
  ]);
});

for (const namespace of [null, "unknown_namespace"]) {
  void test(`does not dispatch a frontend tool from namespace ${String(namespace)}`, async () => {
    const connection = new FakeConnection();
    connection.onTurn = () =>
      emitDynamicBatch(connection.events, [
        {
          id: 1,
          callId: "wrong-origin",
          namespace,
          tool: "weather",
          arguments: {},
        },
      ]);
    const events = await lastValueFrom(
      agentFor(connection)
        .run(
          input({
            tools: [
              { name: "weather", description: "Weather", parameters: {} },
            ],
          }),
        )
        .pipe(toArray()),
    );
    assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
    assert.equal(
      events.some((event) => event.type === EventType.TOOL_CALL_START),
      false,
    );
  });
}

void test("passes current system messages, context and shared state on every run", async () => {
  const connection = new FakeConnection();
  await lastValueFrom(
    agentFor(connection)
      .run(
        input({
          messages: [
            { id: "system", role: "system", content: "Play Wordle" },
            ...input().messages,
          ],
          context: [{ description: "catalog", value: "A2UI catalog" }],
          state: { guesses: 2 },
        }),
      )
      .pipe(toArray()),
  );
  const serialized = JSON.stringify(connection.requests);
  assert.match(serialized, /Play Wordle/);
  assert.match(serialized, /A2UI catalog/);
  assert.match(serialized, /guesses/);
});

void test("turn failures produce RUN_ERROR, never RUN_FINISHED", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () =>
    connection.events.next({
      method: "turn/completed",
      params: {
        turn: { status: "failed", error: { message: "Usage limit reached" } },
      },
    });
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [EventType.RUN_STARTED, EventType.STATE_SNAPSHOT, EventType.RUN_ERROR],
  );
  assert.equal(connection.closed, true);
});

void test("unknown approval requests fail closed instead of hanging", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () =>
    connection.events.next({
      method: "item/commandExecution/requestApproval",
      id: 99,
      params: {},
    });
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.equal(connection.closed, true);
});

void test("unsubscribing cancels the Codex process", () => {
  const connection = new FakeConnection();
  const subscription = agentFor(connection).run(input()).subscribe();
  subscription.unsubscribe();
  assert.equal(connection.closed, true);
});

void test("abortRun completes the stream and terminates the process", async () => {
  const connection = new FakeConnection();
  const agent = agentFor(connection);
  connection.onTurn = () => agent.abortRun();
  const events = await lastValueFrom(agent.run(input()).pipe(toArray()));
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.equal(connection.closed, true);
});

void test("native item IDs are unique across AG-UI runs", async () => {
  const first = await lastValueFrom(
    agentFor(new FakeConnection()).run(input()).pipe(toArray()),
  );
  const second = await lastValueFrom(
    agentFor(new FakeConnection())
      .run(input({ runId: "run-2" }))
      .pipe(toArray()),
  );
  assert.notEqual(
    first.find((event) => event.type === EventType.TEXT_MESSAGE_START)
      ?.messageId,
    second.find((event) => event.type === EventType.TEXT_MESSAGE_START)
      ?.messageId,
  );
});

void test("backend MCP calls include results and do not hand execution to the browser", async () => {
  const connection = new FakeConnection();
  const item = {
    type: "mcpToolCall",
    id: "mcp-1",
    server: "aws-knowledge",
    tool: "search",
    arguments: { query: "S3" },
  };
  connection.onTurn = () => {
    connection.events.next({
      method: "rawResponseItem/completed",
      params: {
        item: {
          type: "function_call",
          call_id: "mcp-1",
          name: "search",
          namespace: "mcp__aws_knowledge",
        },
      },
    });
    connection.events.next({ method: "item/started", params: { item } });
    connection.events.next({
      method: "item/completed",
      params: {
        item: {
          ...item,
          result: { content: [{ type: "text", text: "S3 docs" }] },
        },
      },
    });
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  };
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [
      EventType.RUN_STARTED,
      EventType.STATE_SNAPSHOT,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_END,
      EventType.TOOL_CALL_RESULT,
      EventType.RUN_FINISHED,
    ],
  );
  assert.deepEqual(
    events.find((event) => event.type === EventType.TOOL_CALL_START)?.metadata,
    {
      elmethisCodexTool: "backend",
      elmethisCodexName: "search",
      elmethisCodexNamespace: "mcp__aws_knowledge",
    },
  );
});

void test("backend notifications cannot invoke a same-named browser tool, and replay keeps the native name", async () => {
  const connection = new FakeConnection();
  const publicName = "mcp__aws-knowledge__search";
  const tools = [publicName, `codex_backend__${publicName}`].map((name) => ({
    name,
    description: "Browser tool",
    parameters: {},
  }));
  connection.onTurn = () => {
    connection.events.next({
      method: "rawResponseItem/completed",
      params: {
        item: {
          type: "function_call",
          call_id: "search",
          name: "search",
          namespace: "mcp__aws_knowledge",
        },
      },
    });
    connection.events.next({
      method: "item/completed",
      params: {
        item: {
          type: "mcpToolCall",
          id: "search",
          server: "aws-knowledge",
          tool: "search",
          arguments: {},
          result: { content: [] },
        },
      },
    });
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  };
  const events = await lastValueFrom(
    agentFor(connection).run(input({ tools })).pipe(toArray()),
  );
  const call = events.find((event) => event.type === EventType.TOOL_CALL_START);
  assert.ok(call);
  assert.ok(typeof call.toolCallId === "string");
  // useAgent dispatches tool-end events by public name. A backend notification
  // must never match the browser registry and trigger a second execution.
  assert.equal(
    tools.some((tool) => tool.name === call.toolCallName),
    false,
  );
  assert.equal(
    call.toolCallName,
    `codex_backend__codex_backend__${publicName}`,
  );
  assert.deepEqual(call.metadata, {
    elmethisCodexTool: "backend",
    elmethisCodexName: "search",
    elmethisCodexNamespace: "mcp__aws_knowledge",
  });
  connection.requests = [];
  connection.onTurn = () =>
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  await lastValueFrom(
    agentFor(connection)
      .run(
        input({
          messages: [
            {
              id: "assistant",
              role: "assistant",
              toolCalls: [
                {
                  id: call.toolCallId,
                  type: "function",
                  function: { name: call.toolCallName, arguments: "{}" },
                  metadata: call.metadata,
                },
              ],
            },
            {
              id: "result",
              role: "tool",
              toolCallId: call.toolCallId,
              content: "Done",
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  const history = connection.requests.find(
    (request) => request.method === "thread/inject_items",
  )?.params;
  assert.ok(history && typeof history === "object");
  const items: unknown = Reflect.get(history, "items");
  assert.ok(Array.isArray(items));
  assert.deepEqual(items[0], {
    type: "function_call",
    call_id: call.toolCallId,
    name: "search",
    namespace: "mcp__aws_knowledge",
    arguments: "{}",
  });
});

void test("closes in-flight backend tools before handing off a parallel frontend call", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () => {
    connection.events.next({
      method: "rawResponseItem/completed",
      params: {
        item: {
          type: "function_call",
          call_id: "mcp",
          name: "search",
          namespace: "mcp__aws_knowledge",
        },
      },
    });
    connection.events.next({
      method: "item/started",
      params: {
        item: {
          type: "mcpToolCall",
          id: "mcp",
          server: "aws-knowledge",
          tool: "search",
          arguments: {},
        },
      },
    });
    emitDynamicBatch(connection.events, [
      {
        id: 1,
        callId: "frontend",
        namespace: "elmethis_frontend",
        tool: "weather",
        arguments: {},
      },
    ]);
  };
  const events = await lastValueFrom(
    agentFor(connection)
      .run(
        input({
          tools: [{ name: "weather", description: "Weather", parameters: {} }],
        }),
      )
      .pipe(toArray()),
  );
  assert.ok(
    events.some(
      (event) =>
        event.type === EventType.TOOL_CALL_RESULT &&
        event.toolCallId === "run-1:mcp",
    ),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
});

void test("streams reasoning summaries, not raw reasoning", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () => {
    connection.events.next({
      method: "rawResponseItem/completed",
      params: { item: { type: "reasoning", content: "private raw reasoning" } },
    });
    connection.events.next({
      method: "item/reasoning/textDelta",
      params: { itemId: "reason", delta: "private" },
    });
    connection.events.next({
      method: "item/reasoning/summaryTextDelta",
      params: { itemId: "reason", delta: "Checking weather" },
    });
    connection.events.next({
      method: "item/completed",
      params: { item: { type: "reasoning", id: "reason" } },
    });
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  };
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [
      EventType.RUN_STARTED,
      EventType.STATE_SNAPSHOT,
      EventType.REASONING_START,
      EventType.REASONING_MESSAGE_START,
      EventType.REASONING_MESSAGE_CONTENT,
      EventType.REASONING_MESSAGE_END,
      EventType.REASONING_END,
      EventType.RUN_FINISHED,
    ],
  );
  assert.doesNotMatch(JSON.stringify(events), /private/);
});

void test("preserves structured web-search results in AG-UI history", async () => {
  const connection = new FakeConnection();
  connection.onTurn = () => {
    const started = {
      type: "webSearch",
      id: "search-1",
      query: "codex",
      action: { type: "search", query: "codex" },
      results: null,
    };
    connection.events.next({
      method: "item/started",
      params: { item: started },
    });
    connection.events.next({
      method: "item/completed",
      params: {
        item: {
          ...started,
          results: [{ title: "Kept", url: "https://example.com" }],
        },
      },
    });
    connection.events.next({
      method: "turn/completed",
      params: { turn: { status: "completed" } },
    });
  };
  const events = await lastValueFrom(
    agentFor(connection).run(input()).pipe(toArray()),
  );
  const result = events.find(
    (event) => event.type === EventType.TOOL_CALL_RESULT,
  );
  assert.ok(result && result.type === EventType.TOOL_CALL_RESULT);
  const content = result.content;
  assert.equal(typeof content, "string");
  assert.deepEqual(JSON.parse(String(content)), {
    action: { type: "search", query: "codex" },
    results: [{ title: "Kept", url: "https://example.com" }],
  });
});

void test("rejects excessive images before resolving or starting Codex", async () => {
  const connection = new FakeConnection();
  let resolved = 0;
  const agent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    imageResolver: () => {
      resolved++;
      return Promise.resolve("data:image/png;base64,aW1hZ2U=");
    },
  });
  const events = await lastValueFrom(
    agent
      .run(
        input({
          messages: [
            {
              id: "images",
              role: "user",
              content: Array.from({ length: 21 }, (_, index) => ({
                type: "image" as const,
                source: {
                  type: "url" as const,
                  value: `https://example.com/${index}.png`,
                },
              })),
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.match(JSON.stringify(events.at(-1)), /20 images/);
  assert.equal(resolved, 0);
  assert.deepEqual(connection.requests, []);
});

void test("bounds distinct image downloads to four per run", async () => {
  const connection = new FakeConnection();
  const fourStarted = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  let started = 0;
  let active = 0;
  let peak = 0;
  const agent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    async imageResolver() {
      started++;
      active++;
      peak = Math.max(peak, active);
      if (started === 4) {
        fourStarted.resolve();
      }
      await release.promise;
      active--;
      return "data:image/png;base64,aW1hZ2U=";
    },
  });
  const result = lastValueFrom(
    agent
      .run(
        input({
          messages: [
            {
              id: "images",
              role: "user",
              content: Array.from({ length: 5 }, (_, index) => ({
                type: "image" as const,
                source: {
                  type: "url" as const,
                  value: `https://example.com/${index}.png`,
                },
              })),
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  await fourStarted.promise;
  const startedBeforeRelease = started;
  release.resolve();
  const events = await result;
  assert.equal(startedBeforeRelease, 4);
  assert.equal(peak, 4);
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
});

void test("rejects images exceeding the aggregate per-run byte budget", async () => {
  const connection = new FakeConnection();
  const fullImage = `data:image/png;base64,${Buffer.alloc(5 * 1024 * 1024).toString("base64")}`;
  const agent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    imageResolver: () => Promise.resolve(fullImage),
  });
  const events = await lastValueFrom(
    agent
      .run(
        input({
          messages: [
            {
              id: "images",
              role: "user",
              content: Array.from({ length: 5 }, (_, index) => ({
                type: "image" as const,
                source: {
                  type: "url" as const,
                  value: `https://example.com/${index}.png`,
                },
              })),
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.match(JSON.stringify(events.at(-1)), /20 MiB/);
  assert.equal(
    connection.requests.some((request) => request.method === "turn/start"),
    false,
  );
});

void test("accepts images totaling the exact aggregate per-run byte budget", async () => {
  const connection = new FakeConnection();
  const image = `data:image/png;base64,${Buffer.alloc(4 * 1024 * 1024).toString("base64")}`;
  const allowances: number[] = [];
  const agent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    imageResolver: (_url, _signal, allowance) => {
      allowances.push(allowance);
      return Promise.resolve(image);
    },
  });
  const events = await lastValueFrom(
    agent
      .run(
        input({
          messages: [
            {
              id: "images",
              role: "user",
              content: Array.from({ length: 5 }, (_, index) => ({
                type: "image" as const,
                source: {
                  type: "url" as const,
                  value: `https://example.com/${index}.png`,
                },
              })),
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
  assert.deepEqual(allowances, [
    5 * 1024 * 1024,
    5 * 1024 * 1024,
    5 * 1024 * 1024,
    5 * 1024 * 1024,
    4 * 1024 * 1024,
  ]);
  assert.equal(
    connection.requests.some((request) => request.method === "turn/start"),
    true,
  );
});

void test("abort cancels image downloading without starting inference", async () => {
  const connection = new FakeConnection();
  let downloading!: () => void;
  const ready = new Promise<void>((resolve) => {
    downloading = resolve;
  });
  let imageSignal: AbortSignal | undefined;
  const agent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    imageResolver: (_url, signal) => {
      imageSignal = signal;
      downloading();
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Aborted")), {
          once: true,
        });
      });
    },
  });
  const result = lastValueFrom(
    agent
      .run(
        input({
          messages: [
            {
              id: "image",
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "url",
                    value: "https://example.com/image.png",
                  },
                },
              ],
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  await ready;
  agent.abortRun();
  const events = await result;
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.equal(imageSignal?.aborted, true);
  assert.equal(
    connection.requests.some((request) => request.method === "turn/start"),
    false,
  );
  assert.equal(connection.closed, true);
});

void test("delegates case-insensitive image URL validation to the resolver", async () => {
  for (const url of [
    "HTTPS://example.com/image.png",
    "data:IMAGE/PNG;base64,aW1hZ2U=",
  ]) {
    const connection = new FakeConnection();
    let resolved = false;
    const agent = new CodexAgentAdapter({
      connectionFactory: () => connection,
      imageResolver: (value) => {
        assert.equal(value, url);
        resolved = true;
        return Promise.resolve("data:image/png;base64,aW1hZ2U=");
      },
    });
    const events = await lastValueFrom(
      agent
        .run(
          input({
            messages: [
              {
                id: "image",
                role: "user",
                content: [
                  { type: "image", source: { type: "url", value: url } },
                ],
              },
            ],
          }),
        )
        .pipe(toArray()),
    );
    assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
    assert.equal(resolved, true);
  }
});

void test("image input stays structured and local-file URLs are rejected", async () => {
  const connection = new FakeConnection();
  const imageInput = input({
    messages: [
      {
        id: "image",
        role: "user",
        content: [
          { type: "text", text: "Describe this" },
          {
            type: "image",
            source: { type: "url", value: "https://example.com/image.png" },
          },
        ],
      },
    ],
  });
  const inlineImage = "data:image/png;base64,aW1hZ2U=";
  const imageAgent = new CodexAgentAdapter({
    connectionFactory: () => connection,
    imageResolver: (url) => {
      assert.equal(url, "https://example.com/image.png");
      return Promise.resolve(inlineImage);
    },
  });
  await lastValueFrom(imageAgent.run(imageInput).pipe(toArray()));
  const params = connection.requests.find(
    (request) => request.method === "turn/start",
  )?.params;
  assert.ok(params && typeof params === "object");
  assert.deepEqual(Reflect.get(params, "input"), [
    { type: "text", text: "Describe this" },
    { type: "image", url: inlineImage },
  ]);
  const events = await lastValueFrom(
    agentFor(new FakeConnection())
      .run(
        input({
          messages: [
            {
              id: "local",
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "url", value: "file:///private/image.png" },
                },
              ],
            },
          ],
        }),
      )
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
});
