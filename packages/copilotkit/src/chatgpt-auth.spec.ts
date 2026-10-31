import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { promisify } from "node:util";
import {
  decodeJwt,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWTPayload,
} from "jose";
import {
  CHATGPT_APP_NAME,
  CHATGPT_APP_TITLE,
  CHATGPT_APP_VERSION,
  CHATGPT_RESOURCE,
  ChatGPTAuth,
} from "./chatgpt-auth.ts";

const issuer = "https://auth.openai.com";
const scopes =
  "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";
const keys = await generateKeyPair("RS256");
const publicKey = {
  ...(await exportJWK(keys.publicKey)),
  kid: "test-key",
  alg: "RS256",
};
const execute = promisify(execFile);

type StoredProfile = {
  id: string;
  clientId?: string;
  subject?: string;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    scopes: string[];
  };
  pendingRefresh?: {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
  };
};

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "elmethis-siwc-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let time = Date.UTC(2026, 5, 1);
  let authorization: URL;
  const urls: URL[] = [];
  const calls: { url: string; init?: RequestInit; body: URLSearchParams }[] =
    [];
  let claims: JWTPayload = {};
  let scope = scopes;
  let accessToken = "access-1";
  let refreshToken = "refresh-1";
  let codeResponse:
    | ((body: URLSearchParams) => Response | Promise<Response>)
    | undefined;
  let refreshResponse:
    | ((body: URLSearchParams) => Response | Promise<Response>)
    | undefined;
  let modelsResponse = Response.json({ models: [] });
  let revocationResponse = new Response(null, { status: 200 });
  let discoveryResponse = Response.json({
    issuer,
    revocation_endpoint: `${issuer}/oauth/revoke`,
  });

  async function idToken(overrides: JWTPayload = {}) {
    return new SignJWT({
      nonce: authorization.searchParams.get("nonce"),
      email: "one@example.com",
      ...claims,
      ...overrides,
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(
        typeof overrides.iss === "string"
          ? overrides.iss
          : typeof claims.iss === "string"
            ? claims.iss
            : issuer,
      )
      .setAudience(overrides.aud ?? claims.aud ?? "oaiapp_one")
      .setSubject(overrides.sub ?? claims.sub ?? "subject-one")
      .setIssuedAt(Math.floor(time / 1000))
      .setExpirationTime(
        overrides.exp ?? claims.exp ?? Math.floor(time / 1000) + 3600,
      )
      .sign(keys.privateKey);
  }

  async function tokenResponse() {
    return Response.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: await idToken(),
      expires_in: 3600,
      token_type: "Bearer",
      scope,
    });
  }

  const fakeFetch: typeof fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const body = new URLSearchParams(
      init?.body instanceof URLSearchParams ? init.body : "",
    );
    calls.push({ url, init, body });
    if (url === `${issuer}/.well-known/jwks.json`) {
      return Response.json({ keys: [publicKey] });
    }
    if (url === `${issuer}/api/accounts/oauth/token`) {
      if (body.get("grant_type") === "refresh_token") {
        return refreshResponse ? refreshResponse(body) : tokenResponse();
      }
      return codeResponse ? codeResponse(body) : tokenResponse();
    }
    if (url === `${issuer}/.well-known/openid-configuration`) {
      return discoveryResponse.clone();
    }
    if (url === `${issuer}/oauth/revoke`) {
      return revocationResponse.clone();
    }
    if (url === `${CHATGPT_RESOURCE}/models`) {
      return modelsResponse.clone();
    }
    throw new Error(`Unexpected test URL: ${url}`);
  };
  const options = {
    directory,
    fetch: fakeFetch,
    now: () => time,
    signInTimeoutMs: 1000,
    requestTimeoutMs: 1000,
  };
  const auth = new ChatGPTAuth(options);

  async function signIn(
    config: {
      profileId?: string;
      newProfile?: boolean;
      callback?: (url: URL, authorization: URL) => void;
      check?: (url: URL) => Promise<void>;
    } = {},
  ) {
    await auth.signIn({
      profileId: config.profileId,
      newProfile: config.newProfile,
      onAuthorizationUrl: async (raw) => {
        authorization = new URL(raw);
        urls.push(authorization);
        await config.check?.(authorization);
        const callback = new URL(
          authorization.searchParams.get("redirect_uri")!,
        );
        callback.search = new URLSearchParams({
          code: "code-secret",
          state: authorization.searchParams.get("state")!,
          client_id: "oaiapp_one",
        }).toString();
        config.callback?.(callback, authorization);
        await fetch(callback);
      },
    });
  }
  async function store() {
    return JSON.parse(
      await readFile(join(directory, "chatgpt-auth.json"), "utf8"),
    ) as {
      hostId: string;
      activeProfileId?: string;
      profiles: StoredProfile[];
    };
  }
  return {
    directory,
    options,
    auth,
    calls,
    urls,
    signIn,
    store,
    idToken,
    advance: (ms: number) => {
      time += ms;
    },
    claims: (value: JWTPayload) => {
      claims = value;
    },
    scope: (value: string) => {
      scope = value;
    },
    tokens: (access: string, refresh: string) => {
      accessToken = access;
      refreshToken = refresh;
    },
    codeResponse: (value: typeof codeResponse) => {
      codeResponse = value;
    },
    refreshResponse: (value: typeof refreshResponse) => {
      refreshResponse = value;
    },
    models: (value: Response) => {
      modelsResponse = value;
    },
    revocation: (value: Response) => {
      revocationResponse = value;
    },
    discovery: (value: Response) => {
      discoveryResponse = value;
    },
  };
}

void test("registers with fresh PKCE/state/nonce, a stable host, exact loopback redirect, and private atomic storage", async (t) => {
  const f = await fixture(t);
  assert.equal(CHATGPT_APP_NAME, "elmethis_copilotkit");
  assert.equal(CHATGPT_APP_TITLE, "Elmethis CopilotKit");
  assert.equal(CHATGPT_APP_VERSION, "1.0.0");
  assert.equal(CHATGPT_RESOURCE, "https://api.openai.com/v1");
  await chmod(f.directory, 0o755);
  await f.signIn();
  const first = f.urls[0].searchParams;
  assert.equal(first.get("client_id"), "dynamic_agent_client");
  assert.equal(first.get("agent_name_hint"), CHATGPT_APP_NAME);
  assert.equal(first.get("scope"), scopes);
  assert.equal(first.get("resource"), CHATGPT_RESOURCE);
  assert.equal(first.get("code_challenge_method"), "S256");
  assert.match(first.get("ext_agent_host_id")!, /^urn:uuid:[0-9a-f-]{36}$/);
  assert.match(
    first.get("redirect_uri")!,
    /^http:\/\/127\.0\.0\.1:\d+\/auth\/callback$/,
  );
  const exchange = f.calls.find(
    (call) => call.body.get("grant_type") === "authorization_code",
  )!;
  assert.equal(exchange.body.get("client_id"), "oaiapp_one");
  assert.equal(exchange.body.get("redirect_uri"), first.get("redirect_uri"));
  assert.equal(exchange.body.get("resource"), CHATGPT_RESOURCE);
  assert.equal(
    createHash("sha256")
      .update(exchange.body.get("code_verifier")!)
      .digest("base64url"),
    first.get("code_challenge"),
  );
  assert.equal(exchange.init?.redirect, "error");
  assert.equal((await lstat(f.directory)).mode & 0o777, 0o700);
  assert.equal(
    (await lstat(join(f.directory, "chatgpt-auth.json"))).mode & 0o777,
    0o600,
  );
  assert.deepEqual(await readdir(f.directory), ["chatgpt-auth.json"]);
  assert.equal(await new ChatGPTAuth(f.options).getAccessToken(), "access-1");
  assert.deepEqual(await f.auth.listProfiles(), [
    {
      id: (await f.store()).profiles[0].id,
      email: "one@example.com",
      subject: "subject-one",
      active: true,
      connected: true,
      sharing: true,
    },
  ]);
  await f.signIn({
    callback: (url) => {
      url.searchParams.delete("client_id");
    },
  });
  const second = f.urls[1].searchParams;
  assert.equal(second.get("client_id"), "oaiapp_one");
  assert.equal(second.get("agent_name_hint"), null);
  assert.equal(second.get("id_token_hint"), null);
  assert.equal(second.get("login_hint"), "one@example.com");
  assert.equal(first.get("ext_agent_host_id"), second.get("ext_agent_host_id"));
  for (const parameter of ["state", "nonce", "code_challenge"]) {
    assert.notEqual(first.get(parameter), second.get(parameter));
  }
  await assert.rejects(fetch(first.get("redirect_uri")!));
});

for (const attack of [
  "state",
  "duplicate-state",
  "duplicate-code",
  "duplicate-client",
  "duplicate-error",
  "missing-client",
  "dynamic-client",
  "code-and-error",
] as const) {
  void test(`rejects callback ${attack} without exchanging a code or exposing secrets`, async (t) => {
    const f = await fixture(t);
    await assert.rejects(
      f.signIn({
        callback: (url) => {
          if (attack === "state") {
            url.searchParams.set("state", "wrong-state");
          }
          if (attack === "duplicate-state") {
            url.searchParams.append("state", "secret-state");
          }
          if (attack === "duplicate-code") {
            url.searchParams.append("code", "secret-code");
          }
          if (attack === "duplicate-client") {
            url.searchParams.append("client_id", "secret-client");
          }
          if (attack === "duplicate-error") {
            url.searchParams.append("error", "secret-error");
            url.searchParams.append("error", "other-error");
          }
          if (attack === "missing-client") {
            url.searchParams.delete("client_id");
          }
          if (attack === "dynamic-client") {
            url.searchParams.set("client_id", "dynamic_agent_client");
          }
          if (attack === "code-and-error") {
            url.searchParams.set("error", "access_denied");
          }
        },
      }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(error.message, /secret-|code-secret/);
        return true;
      },
    );
    assert.equal(
      f.calls.filter((call) => call.url.endsWith("/token")).length,
      0,
    );
    await assert.rejects(fetch(f.urls[0].searchParams.get("redirect_uri")!));
  });
}

void test("validates state before consent denial and never trusts callback scope", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    f.signIn({
      callback: (url) => {
        url.searchParams.delete("code");
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "token-secret");
      },
    }),
    /denied/i,
  );
  assert.equal(f.calls.length, 0);
  f.scope("openid profile email");
  await f.signIn({
    callback: (url) => {
      url.searchParams.set("scope", scopes);
    },
  });
  assert.equal((await f.auth.listProfiles())[0].sharing, false);
  await assert.rejects(f.auth.getAccessToken(), /plan.*(disabled|permission)/i);
  await assert.rejects(f.auth.listModels(), /plan.*(disabled|permission)/i);
  assert.equal(
    f.calls.filter((call) => call.url.endsWith("/models")).length,
    0,
  );
});

void test("retains an issued registration after failed code exchange and after local sign-out", async (t) => {
  const f = await fixture(t);
  f.codeResponse(() =>
    Response.json(
      { error: "invalid_grant", error_description: "refresh-token-secret" },
      { status: 400 },
    ),
  );
  await assert.rejects(f.signIn(), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /invalid_grant/);
    assert.doesNotMatch(error.message, /refresh-token-secret/);
    return true;
  });
  const saved = await f.store();
  assert.equal(saved.profiles[0].clientId, "oaiapp_one");
  assert.equal(saved.activeProfileId, undefined);
  f.codeResponse(undefined);
  await f.signIn();
  assert.equal(f.urls[1].searchParams.get("client_id"), "oaiapp_one");
  assert.deepEqual(await f.auth.signOut(), { revoked: true });
  assert.equal((await f.store()).profiles[0].clientId, "oaiapp_one");
  assert.equal((await f.store()).hostId, saved.hostId);
  const profile = (await f.auth.listProfiles())[0];
  assert.equal(profile.subject, "subject-one");
  assert.equal(profile.connected, false);
  assert.equal(profile.sharing, false);
  assert.equal((await f.store()).profiles[0].credentials, undefined);
  await f.signIn();
  assert.equal(f.urls[2].searchParams.get("id_token_hint"), null);
});

for (const invalid of ["iss", "aud", "nonce", "exp", "signature"] as const) {
  void test(`rejects ID token with invalid ${invalid}`, async (t) => {
    const f = await fixture(t);
    if (invalid === "iss") {
      f.claims({ iss: "https://attacker.example" });
    }
    if (invalid === "aud") {
      f.claims({ aud: "oaiapp_other" });
    }
    if (invalid === "nonce") {
      f.claims({ nonce: "not-the-nonce" });
    }
    if (invalid === "exp") {
      f.claims({ exp: 1 });
    }
    if (invalid === "signature") {
      const otherKeys = await generateKeyPair("RS256");
      f.codeResponse(async () =>
        Response.json({
          id_token: await new SignJWT(decodeJwt(await f.idToken()))
            .setProtectedHeader({ alg: "RS256", kid: "test-key" })
            .sign(otherKeys.privateKey),
          scope: "openid",
        }),
      );
    }
    await assert.rejects(f.signIn(), /ID token/i);
    assert.equal((await f.auth.listProfiles())[0].connected, false);
    assert.equal((await f.store()).profiles[0].clientId, "oaiapp_one");
    await assert.rejects(f.auth.getAccessToken());
  });
}

void test("rejects client or verified-subject changes without replacing existing credentials", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.tokens("should-not-save", "should-not-save");
  await assert.rejects(
    f.signIn({
      callback: (url) => {
        url.searchParams.set("client_id", "oaiapp_other");
      },
    }),
    /client/i,
  );
  f.claims({ sub: "different-subject" });
  await assert.rejects(f.signIn(), /identity|subject/i);
  assert.equal(await f.auth.getAccessToken(), "access-1");
});

void test("keeps same-email registrations separate and activates only a verified sign-in", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  const first = (await f.auth.listProfiles())[0].id;
  f.claims({ sub: "subject-two", aud: "oaiapp_two" });
  f.tokens("access-2", "refresh-2");
  await f.signIn({
    newProfile: true,
    callback: (url) => {
      url.searchParams.set("client_id", "oaiapp_two");
    },
  });
  const profiles = await f.auth.listProfiles();
  assert.equal(profiles.length, 2);
  assert.notEqual(profiles[0].id, profiles[1].id);
  assert.equal(profiles[0].email, profiles[1].email);
  assert.equal(profiles[1].active, true);
  await f.auth.selectProfile(first);
  assert.equal(await f.auth.getAccessToken(), "access-1");
  await assert.rejects(f.auth.selectProfile("missing"), /profile/i);
  await f.auth.signOut();
  await f.auth.selectProfile(profiles[1].id);
  assert.equal(await f.auth.getAccessToken(), "access-2");
});

void test("preserves valid identity-only sign-in even without inference tokens", async (t) => {
  const f = await fixture(t);
  f.codeResponse(async () =>
    Response.json({
      id_token: await f.idToken(),
      scope: "openid profile email",
    }),
  );
  await f.signIn();
  assert.equal((await f.auth.listProfiles())[0].connected, true);
  assert.equal((await f.auth.listProfiles())[0].sharing, false);
  await assert.rejects(f.auth.getAccessToken(), /plan.*(disabled|permission)/i);
});

void test("refreshes six minutes ahead, atomically rotates credentials, and rereads across instances", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.tokens("access-2", "refresh-2");
  assert.equal(await f.auth.getAccessToken(), "access-2");
  const refresh = f.calls.find(
    (call) => call.body.get("grant_type") === "refresh_token",
  )!;
  assert.equal(refresh.body.get("refresh_token"), "refresh-1");
  assert.equal(refresh.body.get("client_id"), "oaiapp_one");
  assert.equal(refresh.body.get("resource"), CHATGPT_RESOURCE);
  assert.equal(refresh.body.has("scope"), false);
  assert.equal(
    (await f.store()).profiles[0].credentials?.refreshToken,
    "refresh-2",
  );
  assert.equal(await new ChatGPTAuth(f.options).getAccessToken(), "access-2");
  assert.equal(
    f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
      .length,
    1,
  );
  f.advance(54 * 60_000);
  f.refreshResponse((body) => {
    assert.equal(body.get("refresh_token"), "refresh-2");
    return Response.json({
      access_token: "access-3",
      refresh_token: "refresh-3",
      token_type: "Bearer",
      expires_in: 3600,
    });
  });
  assert.equal(await f.auth.getAccessToken(), "access-3");
  assert.equal((await f.auth.listProfiles())[0].sharing, true);
});

void test("serializes concurrent runs sharing one authentication manager", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  const started = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  f.refreshResponse(async () => {
    started.resolve();
    await release.promise;
    return Response.json({
      access_token: "shared-rotation",
      refresh_token: "shared-refresh",
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes,
    });
  });
  const first = f.auth.getAccessToken();
  await started.promise;
  const tokens = Promise.all([
    first,
    ...Array.from({ length: 20 }, () => f.auth.getAccessToken()),
  ]);
  release.resolve();
  assert.deepEqual(await tokens, Array<string>(21).fill("shared-rotation"));
  assert.equal(
    f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
      .length,
    1,
  );
});

void test("quarantines a rotated refresh on transient JWKS failure and verifies it before use", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.tokens("rotated-access", "rotated-refresh");
  let unavailable = true;
  const auth = new ChatGPTAuth({
    ...f.options,
    jwks: () =>
      unavailable
        ? Promise.reject(new Error("secret JWKS failure"))
        : Promise.resolve(keys.publicKey),
  });
  await assert.rejects(auth.getAccessToken(), /could not be verified/);
  const staged = (await f.store()).profiles[0];
  assert.equal(staged.credentials?.refreshToken, "refresh-1");
  assert.equal(staged.pendingRefresh?.refreshToken, "rotated-refresh");
  unavailable = false;
  assert.equal(await auth.getAccessToken(), "rotated-access");
  assert.equal(
    f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
      .length,
    1,
  );
  const recovered = (await f.store()).profiles[0];
  assert.equal(recovered.credentials?.refreshToken, "rotated-refresh");
  assert.equal(recovered.pendingRefresh, undefined);
});

void test("never uses a rotated grant with the wrong identity and revokes its newest token on logout", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.claims({ sub: "wrong-subject" });
  f.tokens("unverified-access", "newest-refresh");
  await assert.rejects(f.auth.getAccessToken(), /could not be verified/);
  await assert.rejects(f.auth.getAccessToken(), /could not be verified/);
  assert.equal(
    f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
      .length,
    1,
  );
  assert.equal((await f.store()).profiles[0].subject, "subject-one");
  assert.deepEqual(await f.auth.signOut(), { revoked: true });
  const revoke = f.calls.find((call) => call.url === `${issuer}/oauth/revoke`);
  assert.equal(revoke?.body.get("token"), "newest-refresh");
  const signedOut = (await f.store()).profiles[0];
  assert.equal(signedOut.credentials, undefined);
  assert.equal(signedOut.pendingRefresh, undefined);
});

void test("fails promptly on cross-process refresh contention and never races a rotating token", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  const started = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  f.refreshResponse(async () => {
    started.resolve();
    await release.promise;
    return Response.json({
      access_token: "rotated",
      refresh_token: "rotated-refresh",
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes,
    });
  });
  const refresh = f.auth.getAccessToken();
  await started.promise;
  try {
    await assert.rejects(
      new ChatGPTAuth(f.options).getAccessToken(),
      /in progress|locked/i,
    );
    const child = await execute(process.execPath, [
      "--input-type=module",
      "-e",
      `import { ChatGPTAuth } from ${JSON.stringify(new URL("./chatgpt-auth.ts", import.meta.url).href)}; try { await new ChatGPTAuth({directory: process.argv[1]}).getAccessToken(); process.exitCode = 1; } catch (error) { console.log(error.message); }`,
      f.directory,
    ]);
    assert.match(child.stdout, /in progress|locked/i);
    assert.equal(
      f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
        .length,
      1,
    );
  } finally {
    release.resolve();
  }
  assert.equal(await refresh, "rotated");
  assert.deepEqual(await readdir(f.directory), ["chatgpt-auth.json"]);
});

for (const code of [
  "invalid_grant",
  "invalid_refresh_token",
  "token_expired",
  "refresh_token_expired",
  "refresh_token_invalidated",
  "refresh_token_reused",
]) {
  void test(`clears only credentials on terminal refresh error ${code}`, async (t) => {
    const f = await fixture(t);
    await f.signIn();
    f.advance(54 * 60_000);
    f.refreshResponse(() =>
      Response.json(
        { error: code, error_description: "secret-body" },
        { status: 400 },
      ),
    );
    await assert.rejects(f.auth.getAccessToken(), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /sign in/i);
      assert.doesNotMatch(error.message, /secret-body/);
      return true;
    });
    assert.equal((await f.store()).profiles[0].credentials, undefined);
    assert.equal((await f.store()).profiles[0].clientId, "oaiapp_one");
    assert.equal((await f.auth.listProfiles())[0].subject, "subject-one");
  });
}

for (const failure of [
  "network",
  "server",
  "invalid-client",
  "malformed",
] as const) {
  void test(`preserves credentials after ${failure} refresh failure without leaking raw errors`, async (t) => {
    const f = await fixture(t);
    await f.signIn();
    f.advance(54 * 60_000);
    const before = await readFile(
      join(f.directory, "chatgpt-auth.json"),
      "utf8",
    );
    f.refreshResponse(() => {
      if (failure === "network") {
        throw new Error("secret-network-token");
      }
      if (failure === "server") {
        return Response.json(
          { error: "invalid_grant", detail: "secret-server-token" },
          { status: 503 },
        );
      }
      if (failure === "invalid-client") {
        return Response.json(
          { error: "invalid_client", error_description: "secret-client-token" },
          { status: 400 },
        );
      }
      return Response.json({
        access_token: "new",
        expires_in: 3600,
        token_type: "Bearer",
        scope: scopes,
      });
    });
    await assert.rejects(f.auth.getAccessToken(), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.doesNotMatch(error.message, /secret-|access-1|refresh-1/);
      return true;
    });
    assert.equal(
      await readFile(join(f.directory, "chatgpt-auth.json"), "utf8"),
      before,
    );
    assert.deepEqual(await readdir(f.directory), ["chatgpt-auth.json"]);
  });
}

void test("does not return short-lived tokens, but saves a successful rotation before reporting insufficient validity", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.refreshResponse(() =>
    Response.json({
      access_token: "short",
      refresh_token: "rotated",
      expires_in: 60,
      token_type: "Bearer",
      scope: scopes,
      earliest_refresh_at: Math.floor((f.options.now() + 30_000) / 1000),
    }),
  );
  await assert.rejects(f.auth.getAccessToken(), /validity|expires|refresh/i);
  assert.equal(
    (await f.store()).profiles[0].credentials?.refreshToken,
    "rotated",
  );
  await assert.rejects(f.auth.getAccessToken(), /refresh/i);
  assert.equal(
    f.calls.filter((call) => call.body.get("grant_type") === "refresh_token")
      .length,
    1,
  );
});

void test("uses current bearer credentials for visible models, preserving server order", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.tokens("models-current-token", "refresh-2");
  f.models(
    Response.json({
      models: [
        { slug: "z", display_name: "Z", visibility: "list", extra: true },
        { slug: "hidden", display_name: "Hidden", visibility: "hide" },
        { slug: "a", display_name: "A", visibility: "list" },
      ],
    }),
  );
  assert.deepEqual(await f.auth.listModels(), [
    { slug: "z", display_name: "Z" },
    { slug: "a", display_name: "A" },
  ]);
  const request = f.calls.find((call) => call.url.endsWith("/models"))!;
  assert.equal(
    new Headers(request.init?.headers).get("authorization"),
    "Bearer models-current-token",
  );
  assert.equal(request.init?.method, "GET");
  assert.equal(request.init?.redirect, "error");
  f.models(Response.json({ detail: "secret-body" }, { status: 503 }));
  await assert.rejects(f.auth.listModels(), /503/);
  assert.equal((await f.auth.listProfiles())[0].connected, true);
});

void test("prepares an inference snapshot with one account's token and complete model metadata", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.models(
    Response.json({
      models: [
        {
          slug: "visible-model",
          display_name: "Visible",
          visibility: "list",
          context_window: 128000,
          input_modalities: ["text", "image"],
        },
        { slug: "hidden-model", display_name: "Hidden", visibility: "hide" },
      ],
    }),
  );
  const session = await f.auth.getInferenceSession();
  assert.equal(session.accessToken, "access-1");
  assert.equal(session.models.length, 1);
  assert.equal(session.models[0].context_window, 128000);
  assert.deepEqual(session.models[0].input_modalities, ["text", "image"]);
  const request = f.calls.find(
    (call) => call.url === `${CHATGPT_RESOURCE}/models`,
  );
  assert.equal(
    new Headers(request?.init?.headers).get("authorization"),
    "Bearer access-1",
  );
});

void test("an account switch during discovery never replaces the inference snapshot's bearer", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.models(
    Response.json({
      models: [
        {
          slug: "first-account-model",
          display_name: "First account",
          visibility: "list",
        },
      ],
    }),
  );
  const auth = new ChatGPTAuth({
    ...f.options,
    fetch: async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url === `${CHATGPT_RESOURCE}/models`) {
        f.claims({ sub: "subject-two", aud: "oaiapp_two" });
        f.tokens("second-account-token", "second-account-refresh");
        await f.signIn({
          newProfile: true,
          callback: (url) => url.searchParams.set("client_id", "oaiapp_two"),
        });
      }
      return f.options.fetch(input, init);
    },
  });
  const session = await auth.getInferenceSession();
  assert.equal(session.accessToken, "access-1");
  assert.equal(session.models[0].slug, "first-account-model");
  assert.equal(await f.auth.getAccessToken(), "second-account-token");
});

void test("discovers revocation, clears locally on failure, and rejects untrusted revocation URLs", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.revocation(new Response("secret-revocation-body", { status: 503 }));
  assert.deepEqual(await f.auth.signOut(), { revoked: false });
  const revoke = f.calls.find((call) => call.url.endsWith("/oauth/revoke"))!;
  assert.equal(revoke.body.get("token"), "refresh-1");
  assert.equal(revoke.body.get("token_type_hint"), "refresh_token");
  assert.equal(revoke.body.get("client_id"), "oaiapp_one");
  assert.equal((await f.store()).profiles[0].credentials, undefined);
  await f.signIn();
  f.discovery(
    Response.json({
      issuer,
      revocation_endpoint: "https://attacker.example/revoke",
    }),
  );
  assert.deepEqual(await f.auth.signOut(), { revoked: false });
  assert.equal(
    f.calls.filter((call) => call.url.includes("attacker")).length,
    0,
  );
  assert.equal((await f.store()).profiles[0].credentials, undefined);
});

void test("does not hold a lock while waiting for the browser, and rejects stale sign-in mutations", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  await assert.rejects(
    f.signIn({
      check: async () => {
        assert.equal(
          await new ChatGPTAuth(f.options).getAccessToken(),
          "access-1",
        );
        await new ChatGPTAuth(f.options).signOut();
      },
    }),
    /changed|stale/i,
  );
  assert.equal((await f.auth.listProfiles())[0].connected, false);
});

void test("accepts only the exact callback path and bounds cancellation and timeout with listener cleanup", async (t) => {
  const f = await fixture(t);
  await f.signIn({
    check: async (authorization) => {
      const callback = new URL(authorization.searchParams.get("redirect_uri")!);
      callback.pathname = "/callback";
      assert.equal((await fetch(callback)).status, 404);
      const status = await new Promise<number | undefined>(
        (resolve, reject) => {
          const request = httpRequest(
            callback,
            { path: "/other/../auth/callback?state=wrong" },
            (response) => {
              response.resume();
              response.on("end", () => resolve(response.statusCode));
            },
          );
          request.on("error", reject);
          request.end();
        },
      );
      assert.equal(status, 404);
    },
  });
  const controller = new AbortController();
  let redirect: string | null = null;
  await assert.rejects(
    f.auth.signIn({
      signal: controller.signal,
      onAuthorizationUrl: (raw) => {
        redirect = new URL(raw).searchParams.get("redirect_uri");
        controller.abort(new Error("secret-abort-reason"));
      },
    }),
    /cancel|abort/i,
  );
  await assert.rejects(fetch(redirect!));
  const quick = new ChatGPTAuth({ ...f.options, signInTimeoutMs: 20 });
  await assert.rejects(
    quick.signIn({
      onAuthorizationUrl: (raw) => {
        redirect = new URL(raw).searchParams.get("redirect_uri");
      },
    }),
    /timed out|timeout/i,
  );
  await assert.rejects(fetch(redirect!));
});

void test("saves a rotated refresh token when plan permission is removed, without allowing inference", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  f.advance(54 * 60_000);
  f.scope("openid profile email offline_access");
  f.tokens("identity-access", "identity-refresh");
  await assert.rejects(f.auth.getAccessToken(), /plan.*(disabled|permission)/i);
  assert.equal(
    (await f.store()).profiles[0].credentials?.refreshToken,
    "identity-refresh",
  );
  const profile = (await f.auth.listProfiles())[0];
  assert.equal(profile.connected, true);
  assert.equal(profile.sharing, false);
  await assert.rejects(f.auth.listModels(), /plan.*(disabled|permission)/i);
});

void test("a failed additional registration never switches the active profile", async (t) => {
  const f = await fixture(t);
  await f.signIn();
  const original = (await f.auth.listProfiles())[0].id;
  f.claims({ aud: "oaiapp_two", sub: "subject-two", nonce: "wrong-nonce" });
  await assert.rejects(
    f.signIn({
      newProfile: true,
      callback: (url) => {
        url.searchParams.set("client_id", "oaiapp_two");
      },
    }),
    /ID token/i,
  );
  assert.equal(
    (await f.auth.listProfiles()).find((profile) => profile.active)?.id,
    original,
  );
  assert.equal(await f.auth.getAccessToken(), "access-1");
  assert.equal((await f.store()).profiles[1].clientId, "oaiapp_two");
});

for (const claim of ["sub", "exp", "iat", "nonce"]) {
  void test(`requires ID-token ${claim} rather than trusting an unsigned identity field`, async (t) => {
    const f = await fixture(t);
    f.codeResponse(async () => {
      const payload = decodeJwt(await f.idToken());
      delete payload[claim];
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "RS256", kid: "test-key" })
        .sign(keys.privateKey);
      return Response.json({ id_token: token, scope: "openid profile email" });
    });
    await assert.rejects(f.signIn(), /ID token/i);
    assert.equal((await f.auth.listProfiles())[0].subject, undefined);
  });
}

void test("cancels before opening the browser and cleans up a failing or hung URL publisher", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    f.auth.signIn({
      signal: AbortSignal.abort(),
      onAuthorizationUrl: () => assert.fail("browser must not open"),
    }),
    /cancel/i,
  );
  let redirect: string | null = null;
  await assert.rejects(
    f.auth.signIn({
      onAuthorizationUrl: (raw) => {
        redirect = new URL(raw).searchParams.get("redirect_uri");
        throw new Error("secret-publisher-error");
      },
    }),
    /present.*authorization URL/i,
  );
  await assert.rejects(fetch(redirect!));
  const quick = new ChatGPTAuth({ ...f.options, signInTimeoutMs: 20 });
  await assert.rejects(
    quick.signIn({
      onAuthorizationUrl: (raw) => {
        redirect = new URL(raw).searchParams.get("redirect_uri");
        return new Promise<void>(() => {});
      },
    }),
    /timed out/i,
  );
  await assert.rejects(fetch(redirect!));
  assert.deepEqual(await readdir(f.directory), ["chatgpt-auth.json"]);
});

void test("rejects symlinked credential storage and corrupt state instead of silently replacing identity", async (t) => {
  const f = await fixture(t);
  await writeFile(join(f.directory, "outside.json"), "{}", { mode: 0o600 });
  await symlink(
    join(f.directory, "outside.json"),
    join(f.directory, "chatgpt-auth.json"),
  );
  await assert.rejects(f.auth.listProfiles(), /credential|storage/i);
  await rm(join(f.directory, "chatgpt-auth.json"));
  await writeFile(
    join(f.directory, "chatgpt-auth.json"),
    '{"hostId":"secret-invalid-host"}',
    { mode: 0o600 },
  );
  await assert.rejects(f.auth.listProfiles(), /credential|storage/i);
  assert.match(
    await readFile(join(f.directory, "chatgpt-auth.json"), "utf8"),
    /secret-invalid-host/,
  );
});
