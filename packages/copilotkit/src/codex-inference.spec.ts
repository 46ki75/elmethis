import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { EventType, type Message } from "@ag-ui/core";
import { lastValueFrom, timeout, toArray } from "rxjs";
import { z } from "zod";
import { CodexAgentAdapter } from "./codex-agent.ts";
import { CODEX_CONFIG, codexProcessOptions } from "./codex-config.ts";
import { spawnCodexConnection } from "./codex-rpc.ts";

// Valid 32x32 PNG from the native omission probe. Its tEXt chunk makes the
// base64 require padding; tiny/invalid PNGs can fail for unrelated reasons.
const png =
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAnRFWHRrAGoqbOAAAAAnSURBVHic7c0xDQAADAOg6ql/gVWxYwkYID0WgUAgEAgEAoFA8CUYPzD4EGKr1DEAAAAASUVORK5CYII=";
const inline = `data:image/png;base64,${png}`;
const record = z.record(z.string(), z.unknown());
const inferenceRequest = z.object({
  model: z.literal("fixture-model"),
  input: z.array(
    z.object({
      type: z.string(),
      role: z.string().optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
            image_url: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

const completion = [
  {
    type: "message",
    id: "fixture-message",
    role: "assistant",
    content: [{ type: "output_text", text: "Done" }],
  },
];

async function fixture(
  t: TestContext,
  outputForRequest: (sequence: number, body: unknown) => unknown[] = () =>
    completion,
  extraConfig: string[] = [],
  gateFirstItem = false,
) {
  const bodies: unknown[] = [];
  const failures: unknown[] = [];
  const firstRequest = Promise.withResolvers<void>();
  const requestsBeforeBoundary: string[] = [];
  let boundarySeen = false;
  t.after(() => firstRequest.resolve());
  const server = http.createServer((req, res) => {
    void (async () => {
      assert.equal(req.headers.authorization, undefined);
      assert.equal(req.method, "POST");
      assert.equal(req.url, "/v1/responses");
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(z.instanceof(Buffer).parse(chunk));
      }
      const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      bodies.push(body);
      const output = outputForRequest(bodies.length, body);
      const responseId = `fixture-response-${bodies.length}`;
      const encode = (event: unknown) => `data: ${JSON.stringify(event)}\n\n`;
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.write(
        encode({ type: "response.created", response: { id: responseId } }),
      );
      for (const [output_index, item] of output.entries()) {
        res.write(
          encode({ type: "response.output_item.added", output_index, item }),
        );
        res.write(
          encode({ type: "response.output_item.done", output_index, item }),
        );
        if (gateFirstItem && bodies.length === 1 && output_index === 0) {
          // Cross-channel gate, not a timer: force the first callback to arrive
          // before the rest of the model's response has even been streamed.
          await firstRequest.promise;
        }
      }
      res.end(
        encode({
          type: "response.completed",
          response: {
            id: responseId,
            status: "completed",
            output,
            usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
          },
        }),
      );
    })().catch((error: unknown) => {
      failures.push(error);
      res.writeHead(500);
      res.end();
    });
  });
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const url = `http://127.0.0.1:${address.port}`;

  // Match the other native tests: close() reaps asynchronously, so leave the
  // private home for OS cleanup rather than deleting files beneath the CLI.
  const home = mkdtempSync(join(tmpdir(), "elmethis-codex-inference-"));
  const previous = process.env.COPILOTKIT_CODEX_HOME;
  let options: ReturnType<typeof codexProcessOptions>;
  try {
    process.env.COPILOTKIT_CODEX_HOME = home;
    options = codexProcessOptions();
  } finally {
    if (previous === undefined) {
      delete process.env.COPILOTKIT_CODEX_HOME;
    } else {
      process.env.COPILOTKIT_CODEX_HOME = previous;
    }
  }
  const native = spawnCodexConnection({
    ...options,
    // Do not inherit credentials, user configuration, or external proxies.
    // Any accidental non-loopback HTTP traffic also terminates at the fixture.
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      HOME: home,
      USERPROFILE: home,
      CODEX_HOME: home,
      HTTP_PROXY: url,
      HTTPS_PROXY: url,
      ALL_PROXY: url,
      NO_PROXY: "127.0.0.1,localhost",
      OTEL_SDK_DISABLED: "true",
    },
    args: [
      ...options.args,
      "app-server",
      "--strict-config",
      ...[
        ...CODEX_CONFIG,
        "mcp_servers.aws-knowledge.enabled=false",
        'web_search="disabled"',
        "check_for_update_on_startup=false",
        "analytics.enabled=false",
        "feedback.enabled=false",
        `model_providers.fixture={name="fixture",base_url="${url}/v1",wire_api="responses",requires_openai_auth=false,supports_websockets=false}`,
        'model_provider="fixture"',
        ...extraConfig,
      ].flatMap((value) => ["-c", value]),
    ],
  });
  t.after(() => native.close());
  const observed = native.events.subscribe({
    next(message) {
      if (message.method === "rawResponse/completed") {
        boundarySeen = true;
      }
      if (message.method === "item/tool/call") {
        if (!boundarySeen) {
          requestsBeforeBoundary.push(
            z.object({ callId: z.string() }).parse(message.params).callId,
          );
        }
        firstRequest.resolve();
      }
    },
    error(error: unknown) {
      failures.push(error);
      firstRequest.resolve();
    },
  });
  t.after(() => observed.unsubscribe());
  const agent = new CodexAgentAdapter({
    model: "fixture-model",
    connectionFactory: () => ({
      events: native.events,
      notify: (method, params) => native.notify(method, params),
      respond: (id, result) => native.respond(id, result),
      request(method, params) {
        // Only the adapter's login gate is faked; protocol parsing, inference
        // requests, and completion events come from the pinned native binary.
        if (method === "account/read") {
          return Promise.resolve({ account: { type: "chatgpt" } });
        }
        return native.request(
          method,
          method === "thread/start"
            ? { ...record.parse(params), modelProvider: "fixture" }
            : params,
        );
      },
      close: () => native.close(),
    }),
  });
  return { agent, bodies, failures, requestsBeforeBoundary };
}

void test(
  "native state tool replies continue inference with updated shared state",
  { timeout: 30_000 },
  async (t) => {
    const { agent, bodies, failures } = await fixture(t, (sequence) =>
      sequence === 1
        ? [
            {
              type: "function_call",
              call_id: "update-state",
              name: "ag_ui_update_state",
              arguments: JSON.stringify({ state_updates: { counter: 2 } }),
            },
          ]
        : completion,
    );
    const events = await lastValueFrom(
      agent
        .run({
          threadId: "state",
          runId: "state-run",
          messages: [
            { id: "user", role: "user", content: "Increment the counter" },
          ],
          tools: [],
          context: [],
          state: { counter: 1, preserved: true },
          forwardedProps: {},
        })
        .pipe(timeout(20_000), toArray()),
    );
    assert.deepEqual(failures, []);
    assert.equal(
      events.at(-1)?.type,
      EventType.RUN_FINISHED,
      JSON.stringify(events),
    );
    assert.deepEqual(
      events
        .filter((event) => event.type === EventType.STATE_SNAPSHOT)
        .map((event) => event.snapshot),
      [
        { counter: 1, preserved: true },
        { counter: 2, preserved: true },
      ],
    );
    assert.equal(
      events.some((event) => event.type === EventType.TOOL_CALL_START),
      false,
    );
    assert.equal(bodies.length, 2);
    const continued = z.object({ input: z.array(record) }).parse(bodies[1]);
    const reply = continued.input.find(
      (item) =>
        item.type === "function_call_output" && item.call_id === "update-state",
    );
    assert.equal(
      reply?.output,
      'Current application state: {"counter":2,"preserved":true}',
    );
  },
);

for (const order of [
  "frontend-first",
  "gated-frontend-first",
  "state-first",
  "state-only-first",
] as const) {
  void test(
    `hands off the complete native tool batch: ${order}`,
    { timeout: 30_000 },
    async (t) => {
      const frontend = ["Tokyo", "Osaka"].map((city) => ({
        type: "function_call",
        call_id: `weather-${city}`,
        namespace: "elmethis_frontend",
        name: "weather",
        arguments: JSON.stringify({ city }),
      }));
      const state = {
        type: "function_call",
        call_id: "state-update",
        name: "ag_ui_update_state",
        arguments: '{"state_updates":{"counter":2}}',
      };
      const f = await fixture(
        t,
        (sequence) => {
          if (sequence === 1 && order === "state-only-first") {
            return [
              {
                ...state,
                call_id: "initial-state",
                arguments: '{"state_updates":{"counter":9}}',
              },
            ];
          }
          assert.ok(
            sequence <= (order === "state-only-first" ? 2 : 1),
            "handoff must not start another inference",
          );
          return order === "state-first"
            ? [state, ...frontend]
            : [...frontend, state];
        },
        [],
        order === "gated-frontend-first",
      );
      const events = await lastValueFrom(
        f.agent
          .run({
            threadId: "batch",
            runId: "batch-run",
            state: { counter: 1 },
            context: [],
            forwardedProps: {},
            messages: [
              {
                id: "user",
                role: "user",
                content: "Weather in both cities and update state",
              },
            ],
            tools: [
              {
                name: "weather",
                description: "Weather",
                parameters: {
                  type: "object",
                  properties: { city: { type: "string" } },
                },
              },
            ],
          })
          .pipe(timeout(20_000), toArray()),
      );
      assert.deepEqual(f.failures, []);
      assert.equal(
        events.at(-1)?.type,
        EventType.RUN_FINISHED,
        JSON.stringify(events),
      );
      assert.deepEqual(
        events
          .filter((event) => event.type === EventType.TOOL_CALL_START)
          .map((event) => event.toolCallId)
          .sort(),
        ["weather-Osaka", "weather-Tokyo"],
      );
      assert.deepEqual(
        events
          .filter((event) => event.type === EventType.STATE_SNAPSHOT)
          .map((event) => event.snapshot),
        order === "state-only-first"
          ? [{ counter: 1 }, { counter: 9 }, { counter: 2 }]
          : [{ counter: 1 }, { counter: 2 }],
      );
      assert.equal(f.bodies.length, order === "state-only-first" ? 2 : 1);
      if (order === "gated-frontend-first") {
        assert.deepEqual(f.requestsBeforeBoundary, ["weather-Tokyo"]);
      }
    },
  );
}

for (const name of [
  "ask_frontend",
  "request_user_input",
  "view_image",
  "get_goal",
  "mcp__browser__lookup",
  "elmethis_tool_public",
  "foo.bar",
  "with space",
  "☃",
  "\ud800",
  "x".repeat(129),
  "",
]) {
  void test(
    `frontend ${name} is isolated from native built-ins and replays after removal`,
    { timeout: 30_000 },
    async (t) => {
      let registeredName = name;
      const f = await fixture(t, (sequence, body) => {
        if (sequence !== 1) {
          return completion;
        }
        const { tools } = z.object({ tools: z.array(record) }).parse(body);
        const namespace = tools.find(
          (tool) =>
            tool.type === "namespace" && tool.name === "elmethis_frontend",
        );
        const nativeTool = namespace
          ? z
              .object({ tools: z.array(z.object({ name: z.string() })) })
              .parse(namespace).tools[0]
          : { name };
        assert.ok(nativeTool);
        registeredName = nativeTool.name;
        return [
          {
            type: "function_call",
            call_id: "frontend-call",
            name: nativeTool.name,
            arguments: '{"prompt":"Pick a city"}',
            ...(namespace ? { namespace: namespace.name } : {}),
          },
        ];
      });
      f.agent.setMessages([
        {
          id: "user",
          role: "user",
          content: "Ask me for a city using the browser tool",
        },
      ]);
      await f.agent.runAgent({
        runId: "frontend",
        tools: [
          {
            name,
            description: "Browser city prompt",
            parameters: {
              type: "object",
              properties: { prompt: { type: "string" } },
              required: ["prompt"],
            },
          },
        ],
      });
      assert.deepEqual(f.failures, []);
      const call = f.agent.messages
        .flatMap((message) =>
          message.role === "assistant" ? (message.toolCalls ?? []) : [],
        )
        .find((tool) => tool.id === "frontend-call");
      assert.equal(
        call?.function.name,
        name,
        "Frontend tool must reach the browser, not a native built-in",
      );
      assert.equal(call.function.arguments, '{"prompt":"Pick a city"}');
      assert.deepEqual(call.metadata, { elmethisCodexTool: "frontend" });
      assert.equal(f.bodies.length, 1);

      // Fresh native thread and no current frontend tools: history identity must
      // survive browser execution, removal from the registry, and backend restarts.
      const next = await fixture(t);
      const events = await lastValueFrom(
        next.agent
          .run({
            threadId: "history",
            runId: "continued",
            tools: [],
            context: [],
            state: {},
            forwardedProps: {},
            messages: [
              ...f.agent.messages,
              {
                id: "tool-result",
                role: "tool",
                toolCallId: "frontend-call",
                content: "Tokyo",
              },
            ],
          })
          .pipe(timeout(20_000), toArray()),
      );
      assert.deepEqual(next.failures, []);
      assert.equal(
        events.at(-1)?.type,
        EventType.RUN_FINISHED,
        JSON.stringify(events),
      );
      const history = z
        .object({ input: z.array(record) })
        .parse(next.bodies[0]).input;
      const replay = history.find(
        (item) =>
          item.type === "function_call" && item.call_id === "frontend-call",
      );
      assert.equal(replay?.namespace, "elmethis_frontend");
      assert.equal(replay?.name, registeredName);
      assert.equal(
        history.find(
          (item) =>
            item.type === "function_call_output" &&
            item.call_id === "frontend-call",
        )?.output,
        "Tokyo",
      );
    },
  );
}

void test(
  "frontend handoff records MCP calls still queued behind the native execution lock",
  { timeout: 30_000 },
  async (t) => {
    const extra = [
      `mcp_servers.fixture={command=${JSON.stringify(process.execPath)},args=[${JSON.stringify(fileURLToPath(new URL("./fixtures/codex-mcp.ts", import.meta.url)))}]}`,
    ];
    const f = await fixture(
      t,
      () => [
        {
          type: "function_call",
          call_id: "browser",
          namespace: "elmethis_frontend",
          name: "weather",
          arguments: "{}",
        },
        {
          type: "function_call",
          call_id: "queued-mcp",
          namespace: "mcp__fixture",
          name: "search",
          arguments: '{"query":"local"}',
        },
      ],
      extra,
      true,
    );
    const events = await lastValueFrom(
      f.agent
        .run({
          threadId: "queued",
          runId: "queued-run",
          state: {},
          context: [],
          forwardedProps: {},
          messages: [{ id: "user", role: "user", content: "Use both tools" }],
          tools: [
            {
              name: "weather",
              description: "Weather",
              parameters: { type: "object", properties: {} },
            },
          ],
        })
        .pipe(timeout(20_000), toArray()),
    );
    assert.deepEqual(f.failures, []);
    assert.deepEqual(f.requestsBeforeBoundary, ["browser"]);
    const result = events.find(
      (event) =>
        event.type === EventType.TOOL_CALL_RESULT &&
        event.toolCallId === "queued-run:queued-mcp",
    );
    assert.ok(result, "queued backend call must not silently disappear");
    assert.match(String(result.content), /cancelled/i);
    assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
  },
);

for (const serverName of ["fixture", "fixture-hyphen"]) {
  for (const aliased of [false, true]) {
    void test(
      `MCP native identity survives replay: ${serverName}, alias=${String(aliased)}`,
      { timeout: 30_000 },
      async (t) => {
        const extra = [
          `mcp_servers.${serverName}={command=${JSON.stringify(process.execPath)},args=[${JSON.stringify(fileURLToPath(new URL("./fixtures/codex-mcp.ts", import.meta.url)))}]}`,
        ];
        const f = await fixture(
          t,
          (sequence, body) => {
            if (sequence !== 1) {
              return completion;
            }
            const { tools } = z.object({ tools: z.array(record) }).parse(body);
            const namespace = tools.find(
              (tool) =>
                tool.type === "namespace" &&
                String(tool.name).startsWith("mcp__fixture"),
            );
            assert.ok(namespace);
            return [
              {
                type: "function_call",
                call_id: "mcp-call",
                namespace: namespace.name,
                name: "search",
                arguments: '{"query":"local"}',
              },
            ];
          },
          extra,
        );
        const publicName = `mcp__${serverName}__search`;
        f.agent.setMessages([
          { id: "user", role: "user", content: "Search the fixture" },
        ]);
        await f.agent.runAgent(
          {
            runId: "first",
            tools: aliased
              ? [
                  {
                    name: publicName,
                    description: "Browser tool",
                    parameters: { type: "object", properties: {} },
                  },
                ]
              : [],
          },
          {
            onRunErrorEvent: ({ event }) => {
              f.failures.push(event.message);
            },
          },
        );
        assert.deepEqual(f.failures, []);
        assert.equal(f.bodies.length, 2);
        const original = z
          .object({ input: z.array(record) })
          .parse(f.bodies[1])
          .input.find(
            (item) =>
              item.type === "function_call" && item.call_id === "mcp-call",
          );
        assert.ok(original);
        const call = f.agent.messages.flatMap((message) =>
          message.role === "assistant" ? (message.toolCalls ?? []) : [],
        )[0];
        assert.ok(call);
        assert.equal(
          call.function.name,
          aliased ? `codex_backend__${publicName}` : publicName,
        );

        const next = await fixture(
          t,
          (sequence, body) => {
            if (sequence !== 1) {
              return completion;
            }
            const replay = z
              .object({ input: z.array(record) })
              .parse(body)
              .input.find((item) => item.type === "function_call");
            assert.ok(replay);
            return [
              {
                type: "function_call",
                call_id: "mcp-again",
                name: replay.name,
                namespace: replay.namespace,
                arguments: '{"query":"again"}',
              },
            ];
          },
          extra,
        );
        const events = await lastValueFrom(
          next.agent
            .run({
              threadId: "mcp-replay",
              runId: "second",
              tools: [],
              context: [],
              state: {},
              forwardedProps: {},
              messages: [
                ...f.agent.messages,
                { id: "next", role: "user", content: "Search again" },
              ],
            })
            .pipe(timeout(20_000), toArray()),
        );
        assert.deepEqual(next.failures, []);
        assert.equal(
          events.at(-1)?.type,
          EventType.RUN_FINISHED,
          JSON.stringify(events),
        );
        const replay = z
          .object({ input: z.array(record) })
          .parse(next.bodies[0])
          .input.find((item) => item.type === "function_call");
        assert.equal(replay?.name, original.name);
        assert.equal(replay?.namespace, original.namespace);
        assert.ok(
          events.some(
            (event) =>
              event.type === EventType.TOOL_CALL_RESULT &&
              String(event.content).includes("fixture-result: again"),
          ),
        );
      },
    );
  }
}

type ImageSource = Extract<
  Exclude<Extract<Message, { role: "user" }>["content"], string>[number],
  { type: "image" }
>["source"];
const cases: { name: string; source: ImageSource }[] = [
  { name: "padded URL", source: { type: "url", value: inline } },
  {
    name: "unpadded URL",
    source: { type: "url", value: inline.replace(/=+$/, "") },
  },
  {
    name: "uppercase MIME URL",
    source: { type: "url", value: inline.replace("image/png", "IMAGE/PNG") },
  },
  {
    name: "uppercase data header URL",
    source: {
      type: "url",
      value: inline.replace("data:image/png;base64", "DATA:IMAGE/PNG;BASE64"),
    },
  },
  {
    name: "uppercase MIME data source",
    source: { type: "data", mimeType: "IMAGE/PNG", value: png },
  },
  {
    name: "unpadded uppercase MIME data source",
    source: {
      type: "data",
      mimeType: "IMAGE/PNG",
      value: png.replace(/=+$/, ""),
    },
  },
];

for (const { name, source } of cases) {
  for (const placement of ["current turn", "history"] as const) {
    void test(
      `native inference includes input_image: ${name} in ${placement}`,
      { timeout: 30_000 },
      async (t) => {
        const { agent, bodies, failures } = await fixture(t);
        const messages: Message[] = [
          {
            id: "image",
            role: "user",
            content: [
              { type: "text", text: "Describe this image." },
              { type: "image", source },
            ],
          },
        ];
        if (placement === "history") {
          messages.push({
            id: "next",
            role: "user",
            content: "What color is it?",
          });
        }
        const result = await lastValueFrom(
          agent
            .run({
              threadId: "image-test",
              runId: "image-run",
              messages,
              tools: [],
              context: [],
              state: {},
              forwardedProps: {},
            })
            .pipe(timeout(20_000), toArray()),
        );
        assert.deepEqual(failures, []);
        assert.equal(
          result.at(-1)?.type,
          EventType.RUN_FINISHED,
          JSON.stringify(result),
        );
        assert.equal(bodies.length, 1);
        const body = inferenceRequest.parse(bodies[0]);
        const images = body.input
          .filter((item) => item.type === "message" && item.role === "user")
          .flatMap((item) => item.content ?? [])
          .filter((part) => part.type === "input_image");
        assert.deepEqual(images, [{ type: "input_image", image_url: inline }]);
        assert.doesNotMatch(JSON.stringify(body), /image content omitted/i);
      },
    );
  }
}
