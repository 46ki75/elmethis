import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ChatGPTAuthError } from "./chatgpt-auth.ts";
import {
  runChatGPTCli,
  type ChatGPTCLIAuth,
  type ChatGPTProfile,
} from "./chatgpt-cli.ts";

const usageUrl = "https://chatgpt.com/settings/usage";
const authorizationUrl =
  "https://auth.openai.com/oauth/authorize?client_id=saved-client&state=test-state";

function harness(profiles: ChatGPTProfile[] = []) {
  const calls: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let signInOptions: Parameters<ChatGPTCLIAuth["signIn"]>[0] | undefined;
  const auth: ChatGPTCLIAuth = {
    async signIn(options) {
      calls.push("signIn");
      signInOptions = options;
      await options.onAuthorizationUrl(authorizationUrl);
    },
    listProfiles() {
      calls.push("listProfiles");
      return Promise.resolve(profiles);
    },
    selectProfile(id) {
      calls.push(`select:${id}`);
      for (const profile of profiles) {
        profile.active = profile.id === id;
      }
      return Promise.resolve();
    },
    signOut() {
      calls.push("signOut");
      return Promise.resolve({ revoked: true });
    },
    listModels() {
      calls.push("listModels");
      return Promise.resolve([
        { slug: "z-model", display_name: "First model" },
        { slug: "a-model", display_name: "Second model" },
      ]);
    },
  };
  const output = {
    log: (line: string) => stdout.push(line),
    error: (line: string) => stderr.push(line),
  };
  return {
    auth,
    output,
    calls,
    stdout,
    stderr,
    signInOptions: () => signInOptions,
    run: (args: string[], signal?: AbortSignal) =>
      runChatGPTCli(args, { auth, output, signal }),
  };
}

function activeProfile(): ChatGPTProfile {
  return {
    id: "account-1",
    email: "user@example.com",
    active: true,
    connected: true,
    sharing: true,
  };
}

void test("preserves actionable messages from the sanitized authentication boundary", async () => {
  const h = harness();
  h.auth.signIn = () =>
    Promise.reject(
      new ChatGPTAuthError(
        "Another ChatGPT credential operation is in progress. Retry after it finishes.",
      ),
    );
  assert.equal(await h.run([]), 1);
  assert.match(h.stderr.join("\n"), /credential operation is in progress/);
});

void test("default sign-in reuses the selected registration and reports account/plan state", async () => {
  const h = harness([activeProfile()]);
  assert.equal(await h.run([]), 0);
  assert.deepEqual(h.calls, ["signIn", "listProfiles"]);
  assert.equal(h.signInOptions()?.newProfile, undefined);
  assert.equal(h.signInOptions()?.profileId, undefined);
  const text = h.stdout.join("\n");
  assert.match(text, /Continue with ChatGPT/);
  assert.ok(text.includes(authorizationUrl));
  assert.match(text, /Active account:.*account-1.*user@example.com/);
  assert.match(text, /connected/);
  assert.match(text, /Using ChatGPT plan/);
  assert.ok(text.includes(`Manage usage: ${usageUrl}`));
  assert.deepEqual(h.stderr, []);
});

void test("--new-account creates a separate registration", async () => {
  const h = harness([activeProfile()]);
  assert.equal(await h.run(["--new-account"]), 0);
  assert.equal(h.signInOptions()?.newProfile, true);
  assert.equal(h.signInOptions()?.profileId, undefined);
});

void test("--account reauthorizes the requested saved account", async () => {
  const h = harness([activeProfile()]);
  assert.equal(await h.run(["--account", "account-1"]), 0);
  assert.equal(h.signInOptions()?.profileId, "account-1");
  assert.equal(h.signInOptions()?.newProfile, undefined);
  assert.ok(!h.calls.some((call) => call.startsWith("select:")));
});

void test("--list distinguishes registrations with the same email and marks connection/plan state", async () => {
  const h = harness([
    activeProfile(),
    { ...activeProfile(), id: "account-2", active: false, sharing: false },
    {
      id: "account-3",
      subject: "subject-3",
      active: false,
      connected: false,
      sharing: false,
    },
  ]);
  assert.equal(await h.run(["--list"]), 0);
  assert.deepEqual(h.calls, ["listProfiles"]);
  const text = h.stdout.join("\n");
  assert.match(text, /\* account-1.*user@example.com/);
  assert.match(text, /account-2.*user@example.com.*plan usage: disabled/);
  assert.match(text, /account-3.*disconnected/);
  assert.ok(text.includes(usageUrl));
});

void test("no saved accounts has actionable output without starting OAuth", async () => {
  const h = harness();
  assert.equal(await h.run(["--list"]), 0);
  assert.match(h.stdout.join("\n"), /No saved ChatGPT accounts/);
  assert.match(h.stdout.join("\n"), /Active account: none/);
  assert.deepEqual(h.calls, ["listProfiles"]);
});

void test("--select switches accounts without signing in", async () => {
  const h = harness([
    activeProfile(),
    { ...activeProfile(), id: "account-2", active: false, sharing: false },
  ]);
  assert.equal(await h.run(["--select", "account-2"]), 0);
  assert.deepEqual(h.calls, ["select:account-2", "listProfiles"]);
  const text = h.stdout.join("\n");
  assert.match(text, /Active account:.*account-2/);
  assert.match(text, /ChatGPT plan usage: disabled/);
  assert.doesNotMatch(text, /Using ChatGPT plan/);
});

void test("a disconnected active account is not described as using the plan", async () => {
  const h = harness([{ ...activeProfile(), connected: false }]);
  assert.equal(await h.run(["--list"]), 0);
  assert.match(h.stdout.join("\n"), /disconnected/);
  assert.doesNotMatch(h.stdout.join("\n"), /Using ChatGPT plan/);
});

void test("--logout reports confirmed revocation and retained registration", async () => {
  const h = harness([{ ...activeProfile(), connected: false, sharing: false }]);
  assert.equal(await h.run(["--logout"]), 0);
  assert.deepEqual(h.calls, ["signOut", "listProfiles"]);
  const text = h.stdout.join("\n");
  assert.match(text, /Signed out/);
  assert.match(text, /revoked/);
  assert.match(text, /registration.*retained/i);
  assert.match(text, /disconnected/);
});

void test("--logout warns if remote revocation was not confirmed", async () => {
  const h = harness();
  h.auth.signOut = () => Promise.resolve({ revoked: false });
  assert.equal(await h.run(["--logout"]), 0);
  const text = h.stdout.join("\n");
  assert.match(text, /remote revocation was not confirmed/i);
  assert.match(text, /disconnect.*ChatGPT Settings/i);
  assert.ok(text.includes(usageUrl));
});

void test("--models preserves the account catalog's server order, with no inference", async () => {
  const h = harness([activeProfile()]);
  assert.equal(await h.run(["--models"]), 0);
  assert.deepEqual(h.calls, ["listModels", "listProfiles"]);
  const text = h.stdout.join("\n");
  assert.ok(text.indexOf("z-model") < text.indexOf("a-model"));
  assert.match(text, /First model/);
  assert.match(text, /CODEX_MODEL/);
  assert.match(text, /catalog.*not.*inference/i);
  assert.ok(text.includes(usageUrl));
});

void test("--models handles an empty visible catalog", async () => {
  const h = harness([activeProfile()]);
  h.auth.listModels = () => Promise.resolve([]);
  assert.equal(await h.run(["--models"]), 0);
  assert.match(h.stdout.join("\n"), /No visible models/);
});

void test("--help is local-only and explains supported actions and migration", async () => {
  const h = harness();
  assert.equal(
    await runChatGPTCli(["--help"], {
      auth: () => {
        throw new Error("auth must not load for help");
      },
      output: h.output,
    }),
    0,
  );
  const text = h.stdout.join("\n");
  for (const flag of [
    "--new-account",
    "--account ID",
    "--list",
    "--select ID",
    "--logout",
    "--models",
    "--help",
  ]) {
    assert.ok(text.includes(flag), flag);
  }
  assert.match(text, /PKCE/);
  assert.match(text, /auth\.json.*not.*SIWC/);
  assert.match(text, /device.*not supported/i);
  assert.ok(text.includes(usageUrl));
  assert.deepEqual(h.calls, []);
});

void test("invalid arguments fail before loading auth and never echo user input", async (t) => {
  for (const args of [
    ["--account"],
    ["--account", "--list"],
    ["--account", ""],
    ["--account", " "],
    ["--select"],
    ["--select", "--logout"],
    ["--list", "--models"],
    ["--new-account", "--account", "account-1"],
    ["--help", "--logout"],
    ["--list", "--list"],
    ["--account", "a", "--account", "b"],
    ["--logout", "extra"],
    ["--unknown-secret=token-secret"],
    ["token-secret"],
    ["--account=token-secret"],
  ]) {
    await t.test(JSON.stringify(args), async () => {
      const h = harness();
      let loaded = false;
      assert.equal(
        await runChatGPTCli(args, {
          auth: () => {
            loaded = true;
            return h.auth;
          },
          output: h.output,
        }),
        2,
      );
      assert.equal(loaded, false);
      assert.match(h.stderr.join("\n"), /--help/);
      assert.doesNotMatch(h.stderr.join("\n"), /token-secret/);
      assert.deepEqual(h.calls, []);
    });
  }
});

void test("legacy --device-auth fails with local browser/container guidance", async () => {
  const h = harness();
  assert.equal(await h.run(["--device-auth"]), 2);
  const text = h.stderr.join("\n");
  assert.match(text, /device authorization.*not supported/i);
  assert.match(text, /local.*browser/i);
  assert.match(text, /mount.*credentials/i);
  assert.deepEqual(h.calls, []);
});

void test("upstream errors never expose credentials or stacks", async (t) => {
  for (const args of [
    [],
    ["--list"],
    ["--models"],
    ["--select", "id"],
    ["--logout"],
  ]) {
    await t.test(JSON.stringify(args), async () => {
      const h = harness();
      assert.equal(
        await runChatGPTCli(args, {
          auth: () => {
            throw new Error(
              "access_token=secret-access refresh_token=secret-refresh id_token=secret-id https://example.com/?code=secret-code",
            );
          },
          output: h.output,
        }),
        1,
      );
      assert.doesNotMatch(
        [...h.stdout, ...h.stderr].join("\n"),
        /secret-|Error:|at /,
      );
      assert.ok(h.stderr.join("\n").includes(usageUrl));
    });
  }
});

void test("sign-in failure after showing the safe URL is sanitized", async () => {
  const h = harness();
  h.auth.signIn = async ({ onAuthorizationUrl }) => {
    await onAuthorizationUrl(authorizationUrl);
    throw new Error("refresh_token=secret-refresh");
  };
  assert.equal(await h.run([]), 1);
  assert.match(h.stderr.join("\n"), /sign-in failed/i);
  assert.doesNotMatch([...h.stdout, ...h.stderr].join("\n"), /secret-refresh/);
});

void test("authorization URL output defensively removes credential-bearing hints", async () => {
  const h = harness([activeProfile()]);
  h.auth.signIn = async ({ onAuthorizationUrl }) => {
    await onAuthorizationUrl(
      `${authorizationUrl}&id_token_hint=secret-id&access_token=secret-access&refresh_token=secret-refresh&code=secret-code`,
    );
  };
  assert.equal(await h.run([]), 0);
  const text = [...h.stdout, ...h.stderr].join("\n");
  assert.ok(text.includes(authorizationUrl));
  assert.doesNotMatch(text, /secret-|id_token_hint|access_token|refresh_token/);
});

void test("untrusted or malformed authorization URLs are not logged", async (t) => {
  for (const url of [
    "http://auth.openai.com/?secret-token",
    "https://example.com/?secret-token",
    "https://secret-token:password@auth.openai.com/authorize",
    "malformed secret-token",
  ]) {
    await t.test(url, async () => {
      const h = harness();
      h.auth.signIn = async ({ onAuthorizationUrl }) => {
        await onAuthorizationUrl(url);
      };
      assert.equal(await h.run([]), 1);
      assert.doesNotMatch(
        [...h.stdout, ...h.stderr].join("\n"),
        /secret-token/,
      );
    });
  }
});

void test("terminal control characters from account/model metadata are escaped", async () => {
  const h = harness([
    { ...activeProfile(), email: "user\n\u001b[31m@example.com" },
  ]);
  h.auth.listModels = () =>
    Promise.resolve([{ slug: "model\rspoof", display_name: "Bad\u001b[2J" }]);
  assert.equal(await h.run(["--models"]), 0);
  const text = h.stdout.join("\n");
  assert.ok(!text.includes("\u001b"));
  assert.ok(!text.includes("\r"));
  assert.ok(text.includes("user\\n"));
});

void test("abort is passed to sign-in and returns 130 after auth cleanup", async () => {
  const h = harness();
  const controller = new AbortController();
  let cleanedUp = false;
  const { promise: entered, resolve: onEntered } =
    Promise.withResolvers<void>();
  h.auth.signIn = async ({ signal }) => {
    assert.equal(signal, controller.signal);
    const { promise, reject } = Promise.withResolvers<void>();
    const onAbort = () => reject(new Error("Canceled callback listener"));
    signal?.addEventListener("abort", onAbort, { once: true });
    onEntered();
    try {
      await promise;
    } finally {
      signal?.removeEventListener("abort", onAbort);
      cleanedUp = true;
    }
  };
  const running = h.run([], controller.signal);
  await entered;
  controller.abort();
  assert.equal(await running, 130);
  assert.equal(cleanedUp, true);
  assert.match(h.stderr.join("\n"), /canceled/i);
  assert.deepEqual(h.calls, []);
});

void test("a sign-in that finishes during cancellation does not print success", async () => {
  const h = harness();
  const controller = new AbortController();
  h.auth.signIn = () => {
    controller.abort();
    return Promise.resolve();
  };
  assert.equal(await h.run([], controller.signal), 130);
  assert.doesNotMatch(h.stdout.join("\n"), /Signed in/);
});

void test("already aborted sign-in does not load credentials", async () => {
  const h = harness();
  const controller = new AbortController();
  controller.abort();
  assert.equal(await h.run([], controller.signal), 130);
  assert.deepEqual(h.calls, []);
});

void test("the compatibility entry point supports help and rejects device auth without OAuth", () => {
  for (const [flag, code] of [
    ["--help", 0],
    ["--device-auth", 2],
  ] as const) {
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(new URL("./codex-login.ts", import.meta.url)), flag],
      { encoding: "utf8", timeout: 10_000 },
    );
    assert.equal(result.status, code, result.stderr);
    assert.equal(result.error, undefined);
    assert.doesNotMatch(result.stdout + result.stderr, /ERR_MODULE_NOT_FOUND/);
  }
});

void test("the compatibility entry point handles SIGINT and removes its listener", () => {
  const entry = new URL("./codex-login.ts", import.meta.url).href;
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import assert from "node:assert/strict";
       const before = process.listenerCount("SIGINT");
       const on = process.on;
       process.on = function (event, listener) {
         on.call(this, event, listener);
         if (event === "SIGINT") process.emit("SIGINT");
         return this;
       };
       await import(${JSON.stringify(entry)});
       assert.equal(process.exitCode, 130);
       assert.equal(process.listenerCount("SIGINT"), before);`,
    ],
    { encoding: "utf8", timeout: 10_000 },
  );
  assert.equal(result.status, 130, result.stderr);
  assert.match(result.stderr, /canceled/i);
  assert.equal(result.error, undefined);
});
