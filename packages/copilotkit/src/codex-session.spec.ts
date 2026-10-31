import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Subject } from "rxjs";
import { createCodexSession, selectChatGPTModel } from "./codex-session.ts";
import type { CodexConnection, CodexMessage } from "./codex-rpc.ts";

const models = [
  { slug: "first-model", display_name: "First" },
  { slug: "other-model", display_name: "Other" },
];

void test("selects a model from the signed-in account's ordered catalog", () => {
  assert.equal(selectChatGPTModel(models), "first-model");
  assert.equal(selectChatGPTModel(models, "other-model"), "other-model");
  assert.throws(() => selectChatGPTModel([], undefined), /No models/);
  assert.throws(() => selectChatGPTModel(models, "unavailable"), /CODEX_MODEL/);
});

void test("only passes the app's current OAuth token to the Responses provider", async () => {
  const home = mkdtempSync(join(tmpdir(), "elmethis-plan-session-"));
  const previous = process.env.COPILOTKIT_CODEX_HOME;
  process.env.COPILOTKIT_CODEX_HOME = home;
  const events = new Subject<CodexMessage>();
  const connection: CodexConnection = {
    events,
    request: () => Promise.resolve({}),
    notify() {},
    respond() {},
    close() {},
  };
  const calls: string[] = [];
  let catalogPath = "";
  try {
    const session = await createCodexSession({
      signal: new AbortController().signal,
      auth: {
        getInferenceSession() {
          calls.push("session");
          return Promise.resolve({
            models,
            accessToken: "fresh-private-token",
          });
        },
      },
      connect(options) {
        calls.push("connect");
        assert.equal(
          options.env.ELMETHIS_CHATGPT_ACCESS_TOKEN,
          "fresh-private-token",
        );
        assert.equal(options.env.OPENAI_API_KEY, undefined);
        assert.equal(options.env.CODEX_API_KEY, undefined);
        assert.doesNotMatch(options.args.join(" "), /fresh-private-token/);
        assert.ok(options.args.includes("stdio://"));
        assert.ok(
          options.args.includes('model_provider="elmethis_chatgpt_plan"'),
        );
        const catalog = options.args.find((arg) =>
          arg.startsWith("model_catalog_json="),
        );
        assert.ok(catalog);
        const path: unknown = JSON.parse(
          catalog.slice("model_catalog_json=".length),
        );
        assert.equal(typeof path, "string");
        catalogPath = String(path);
        assert.ok(existsSync(catalogPath));
        return connection;
      },
    });
    assert.equal(session.connection.events, connection.events);
    assert.equal(session.model, "first-model");
    assert.deepEqual(calls, ["session", "connect"]);
    session.connection.close();
    assert.equal(existsSync(catalogPath), false);
  } finally {
    if (previous === undefined) {
      delete process.env.COPILOTKIT_CODEX_HOME;
    } else {
      process.env.COPILOTKIT_CODEX_HOME = previous;
    }
    rmSync(home, { recursive: true, force: true });
  }
});

void test("does not start Codex when consent or model discovery fails", async () => {
  let connected = false;
  await assert.rejects(
    createCodexSession({
      signal: new AbortController().signal,
      auth: {
        getInferenceSession: () =>
          Promise.reject(new Error("ChatGPT plan permission required")),
      },
      connect() {
        connected = true;
        throw new Error("must not start");
      },
    }),
    /ChatGPT plan permission required/,
  );
  assert.equal(connected, false);
});

void test("cancellation during account preparation never launches a child", async () => {
  const controller = new AbortController();
  let connected = false;
  await assert.rejects(
    createCodexSession({
      signal: controller.signal,
      auth: {
        getInferenceSession() {
          controller.abort();
          return Promise.resolve({ models, accessToken: "must-not-be-used" });
        },
      },
      connect() {
        connected = true;
        throw new Error("must not start");
      },
    }),
    { name: "AbortError" },
  );
  assert.equal(connected, false);
});
