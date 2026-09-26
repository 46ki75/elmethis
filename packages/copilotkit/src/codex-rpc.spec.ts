import assert from "node:assert/strict";
import { ChildProcess } from "node:child_process";
import { once } from "node:events";
import { test, type TestContext } from "node:test";
import { firstValueFrom, filter } from "rxjs";
import {
  spawnCodexConnection,
  type CodexConnection,
  type CodexMessage,
} from "./codex-rpc.ts";

function fakeServer(
  t: TestContext,
  script: string,
  readStdin = true,
): CodexConnection {
  const connection = spawnCodexConnection({
    command: process.execPath,
    args: [
      "-e",
      `const { createInterface } = require("node:readline");
       const send = (message) => process.stdout.write(JSON.stringify(message) + "\\n");
       ${readStdin ? "const lines = createInterface({ input: process.stdin });" : ""}
       ${script}`,
    ],
    cwd: process.cwd(),
    env: { ...process.env, CODEX_RPC_TEST: "test-environment" },
  });
  t.after(() => connection.close());
  return connection;
}

function observe(connection: CodexConnection) {
  const messages: CodexMessage[] = [];
  const failure = Promise.withResolvers<unknown>();
  const completion = Promise.withResolvers<void>();
  connection.events.subscribe({
    next: (message) => messages.push(message),
    error: (error: unknown) => failure.resolve(error),
    complete: () => completion.resolve(),
  });
  return { messages, failure: failure.promise, completion: completion.promise };
}

function event(connection: CodexConnection, method: string) {
  return firstValueFrom(
    connection.events.pipe(filter((message) => message.method === method)),
  );
}

void test("correlates JSONL handshake and out-of-order responses while forwarding server events", async (t) => {
  const connection = fakeServer(
    t,
    `let first;
     lines.on("line", (line) => {
       const message = JSON.parse(line);
       if ("jsonrpc" in message) process.exit(91);
       if (message.method === "initialize") {
         send({ method: "tool/call", id: message.id, params: { name: "frontend" } });
         send({ id: message.id, result: {
           id: message.id, params: message.params,
           cwd: process.cwd(), env: process.env.CODEX_RPC_TEST,
         } });
       } else if (message.method === "initialized") {
         if ("id" in message) process.exit(92);
         send({ method: "tool/call", id: "server-id" });
         send({ method: "ready", params: message.params });
       } else if (!first) {
         first = message;
       } else {
         send({ id: message.id, result: message });
         send({ id: first.id, result: first });
       }
     });`,
  );
  const observed = observe(connection);
  assert.deepEqual(
    await connection.request("initialize", { clientInfo: "test" }),
    {
      id: 1,
      params: { clientInfo: "test" },
      cwd: process.cwd(),
      env: "test-environment",
    },
  );
  const ready = event(connection, "ready");
  connection.notify("initialized", {});
  await ready;
  assert.deepEqual(observed.messages, [
    { method: "tool/call", id: 1, params: { name: "frontend" } },
    { method: "tool/call", id: "server-id" },
    { method: "ready", params: {} },
  ]);
  assert.deepEqual(
    await Promise.all([
      connection.request("first", { value: 1 }),
      connection.request("second", null),
    ]),
    [
      { id: 2, method: "first", params: { value: 1 } },
      { id: 3, method: "second", params: null },
    ],
  );
});

void test("rejects malformed Unicode before writing JSONL and remains usable", async (t) => {
  const connection = fakeServer(
    t,
    `lines.on("line", (line) => {
       const message = JSON.parse(line);
       send({ id: message.id, result: message.params });
     });`,
  );
  await assert.rejects(connection.request("bad", { value: "\ud800" }), {
    message: "Codex app-server params must contain well-formed Unicode.",
  });
  assert.deepEqual(await connection.request("good", { value: "ok" }), {
    value: "ok",
  });
});

void test("replies to native tool requests without allocating a client request ID", async (t) => {
  const connection = fakeServer(
    t,
    `
    lines.on("line", (line) => {
      const message = JSON.parse(line);
      if (message.method === "initialize") {
        send({ id: message.id, result: {} });
        send({ method: "item/tool/call", id: "server-state", params: {} });
      } else { send({ method: "received", params: message }); }
    });
  `,
  );
  const call = event(connection, "item/tool/call");
  await connection.request("initialize", {});
  const request = await call;
  assert.equal(request.id, "server-state");
  const received = event(connection, "received");
  const result = {
    success: true,
    contentItems: [{ type: "inputText", text: "Updated" }],
  };
  connection.respond("server-state", result);
  assert.deepEqual((await received).params, { id: "server-state", result });
  connection.close();
  assert.throws(() => connection.respond(99, result), /closed/);
});

void test("reads fragmented final output before reporting process exit", async (t) => {
  const connection = fakeServer(
    t,
    `lines.once("line", (line) => {
       const id = JSON.parse(line).id;
       const output = JSON.stringify({ id, result: "final response" }) + "\\n";
       process.stdout.write(output.slice(0, 8));
       setImmediate(() => process.stdout.write(output.slice(8), () => process.exit(0)));
     });`,
  );
  const observed = observe(connection);
  const timeout = t.mock.method(globalThis, "setTimeout");
  const clear = t.mock.method(globalThis, "clearTimeout");
  assert.equal(await connection.request("final", {}), "final response");
  const timer = timeout.mock.calls[0]?.result;
  assert.ok(timer);
  assert.ok(clear.mock.calls.some((call) => call.arguments[0] === timer));
  const failure = await observed.failure;
  assert.ok(failure instanceof Error);
  assert.match(failure.message, /exited.*0/);
});

void test("rejects RPC errors without failing the connection or exposing error data", async (t) => {
  const connection = fakeServer(
    t,
    `lines.on("line", (line) => {
       const message = JSON.parse(line);
       if (message.method === "bad") {
         send({ id: message.id, error: {
           code: -32602, message: "Invalid settings", data: "secret-error-data",
         } });
       } else {
         send({ id: message.id, result: null });
       }
     });`,
  );
  observe(connection);
  await assert.rejects(connection.request("bad", {}), {
    message: "Codex app-server RPC error -32602: Invalid settings",
  });
  assert.equal(await connection.request("good", {}), null);
});

for (const { name, script, expected } of [
  {
    name: "nonzero exit",
    script:
      'process.stderr.write("secret-stderr".repeat(10000)); process.exit(7);',
    expected: /exited.*7/,
  },
  {
    name: "premature clean exit",
    script: "process.exit(0);",
    expected: /exited.*0/,
  },
  {
    name: "signal exit",
    script: 'process.kill(process.pid, "SIGTERM");',
    expected: /exited.*SIGTERM/,
  },
  {
    name: "malformed JSON",
    script: 'process.stdout.write("secret-invalid-json\\n");',
    expected: /invalid JSON/,
  },
  {
    name: "invalid message shape",
    script: "send(null);",
    expected: /invalid.*message/,
  },
  {
    name: "invalid server request ID",
    script: 'send({ method: "tool/call", id: null });',
    expected: /invalid.*message/,
  },
  {
    name: "invalid response",
    script: "send({ id: 1 });",
    expected: /invalid.*message/,
  },
  {
    name: "invalid error response",
    script: 'send({ id: 1, error: "secret-error" });',
    expected: /invalid.*message/,
  },
]) {
  void test(`fails all pending requests and events on ${name}`, async (t) => {
    const connection = fakeServer(
      t,
      `lines.once("line", () => { ${script} });`,
    );
    const observed = observe(connection);
    await Promise.all([
      assert.rejects(connection.request("one", {}), expected),
      assert.rejects(connection.request("two", {}), expected),
    ]);
    const failure = await observed.failure;
    assert.ok(failure instanceof Error);
    assert.match(failure.message, expected);
    assert.doesNotMatch(failure.message, /secret/);
    await assert.rejects(connection.request("after-failure", {}), expected);
    connection.close();
    connection.close();
  });
}

void test("reports an actionable spawn error through requests and events", async (t) => {
  const connection = spawnCodexConnection({
    command: `${process.cwd()}/missing-codex-rpc-test-executable`,
    args: [],
    cwd: process.cwd(),
    env: process.env,
  });
  t.after(() => connection.close());
  const observed = observe(connection);
  await assert.rejects(connection.request("initialize", {}), /start.*ENOENT/);
  const failure = await observed.failure;
  assert.ok(failure instanceof Error);
  assert.match(failure.message, /command.*cwd/);
});

void test("handles a closed stdin pipe without an unhandled EPIPE", async (t) => {
  const connection = fakeServer(
    t,
    `require("node:fs").closeSync(0);
     setInterval(() => {}, 1000);
     send({ method: "ready" });`,
    // Close the raw fd before Node's stdin machinery takes ownership of it.
    false,
  );
  const observed = observe(connection);
  await event(connection, "ready");
  await assert.rejects(connection.request("initialize", {}), /stdin/);
  const failure = await observed.failure;
  assert.ok(failure instanceof Error);
  assert.match(failure.message, /stdin/);
});

void test("bounds requests to 30 seconds and ignores late or unknown responses", async (t) => {
  const connection = fakeServer(
    t,
    `let held;
     lines.on("line", (line) => {
       const message = JSON.parse(line);
       if (message.method === "hold") {
         held = message.id;
         send({ method: "holding" });
       } else {
         send({ id: held, result: "late" });
         send({ id: 999, result: "unknown" });
         send({ id: message.id, result: "ok" });
       }
     });`,
  );
  observe(connection);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let settled = false;
  const holding = event(connection, "holding");
  const timedOut = assert.rejects(
    connection.request("hold", {}).finally(() => {
      settled = true;
    }),
    /timed out.*30000/,
  );
  await holding;
  t.mock.timers.tick(29_999);
  await Promise.resolve();
  assert.equal(settled, false);
  t.mock.timers.tick(1);
  await timedOut;
  assert.equal(await connection.request("next", {}), "ok");
  t.mock.timers.tick(30_000);
  t.mock.timers.reset();
});

void test("rejects unserializable params without leaving pending work", async (t) => {
  const connection = fakeServer(
    t,
    `lines.on("line", (line) => {
       send({ id: JSON.parse(line).id, result: "ok" });
     });`,
  );
  observe(connection);
  await assert.rejects(connection.request("bad", 1n), /JSON/);
  assert.throws(() => connection.notify("bad", 1n), /JSON/);
  assert.equal(await connection.request("good", {}), "ok");
});

void test("close is idempotent, rejects pending work, completes events and forbids writes", async (t) => {
  const connection = fakeServer(
    t,
    `process.on("SIGTERM", () => process.exit(0));
     setInterval(() => {}, 1000);
     lines.on("line", () => send({ method: "holding" }));`,
  );
  const observed = observe(connection);
  const timeout = t.mock.method(globalThis, "setTimeout");
  const clear = t.mock.method(globalThis, "clearTimeout");
  const kill = t.mock.method(ChildProcess.prototype, "kill");
  const holding = event(connection, "holding");
  const pending = assert.rejects(connection.request("hold", {}), /closed/);
  await holding;
  connection.close();
  connection.close();
  const child: unknown = kill.mock.calls[0]?.this;
  assert.ok(child instanceof ChildProcess);
  assert.deepEqual(await once(child, "exit"), [0, null]);
  assert.equal(kill.mock.callCount(), 1);
  assert.equal(timeout.mock.callCount(), 2);
  for (const call of timeout.mock.calls) {
    assert.ok(
      clear.mock.calls.some((cleared) => cleared.arguments[0] === call.result),
    );
  }
  await pending;
  await observed.completion;
  await assert.rejects(connection.request("after-close", {}), /closed/);
  assert.throws(() => connection.notify("after-close", {}), /closed/);
});

void test("can close while handing a server request off to frontend tools", async (t) => {
  const connection = fakeServer(
    t,
    `lines.on("line", () => {
       process.stdout.write(
         JSON.stringify({ method: "tool/call", id: "tool" }) + "\\n" +
         JSON.stringify({ method: "should-not-arrive" }) + "\\n"
       );
     });`,
  );
  const observed = observe(connection);
  connection.events.subscribe({
    next: () => connection.close(),
    error: () => assert.fail("Explicit close must not error"),
  });
  await assert.rejects(connection.request("turn/start", {}), /closed/);
  await observed.completion;
  assert.deepEqual(observed.messages, [{ method: "tool/call", id: "tool" }]);
});

void test("kills a child that ignores SIGTERM without keeping a referenced fallback timer", async (t) => {
  const connection = fakeServer(
    t,
    `process.on("SIGTERM", () => {});
     setInterval(() => {}, 1000);
     send({ method: "ready" });`,
  );
  observe(connection);
  await event(connection, "ready");
  const timeout = t.mock.method(globalThis, "setTimeout");
  const kill = t.mock.method(ChildProcess.prototype, "kill");
  connection.close();
  assert.equal(timeout.mock.callCount(), 1);
  const timer = timeout.mock.calls[0]?.result;
  assert.ok(timer);
  assert.equal(timer.hasRef(), false);
  const child: unknown = kill.mock.calls[0]?.this;
  assert.ok(child instanceof ChildProcess);
  assert.deepEqual(await once(child, "exit"), [null, "SIGKILL"]);
  assert.deepEqual(
    kill.mock.calls.map((call) => call.arguments),
    [["SIGTERM"], ["SIGKILL"]],
  );
});
