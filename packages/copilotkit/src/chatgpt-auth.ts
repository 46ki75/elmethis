import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, open, rename, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import {
  createRemoteJWKSet,
  customFetch,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { z } from "zod";

export const CHATGPT_APP_NAME = "elmethis_copilotkit";
export const CHATGPT_APP_TITLE = "Elmethis CopilotKit";
export const CHATGPT_APP_VERSION = "1.0.0";
export const CHATGPT_RESOURCE = "https://api.openai.com/v1";

// Independently implemented from the public SIWC protocol, not OpenAI DevKit.
// https://developers.openai.com/siwc/token-sharing-open-source/sign-in
// https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions
const ISSUER = "https://auth.openai.com";
const AUTHORIZE = `${ISSUER}/api/accounts/authorize`;
const TOKEN = `${ISSUER}/api/accounts/oauth/token`;
const DISCOVERY = `${ISSUER}/.well-known/openid-configuration`;
const JWKS = `${ISSUER}/.well-known/jwks.json`;
const SCOPES =
  "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";
const PLAN_SCOPE = "chatgpt.tokens.use.direct";
// A caller may hold this token for an entire five-minute run without refreshing.
const MIN_VALIDITY_MS = 6 * 60_000;
const TERMINAL_REFRESH_CODES = new Set([
  "invalid_grant",
  "invalid_refresh_token",
  "token_expired",
  "refresh_token_expired",
  "refresh_token_invalidated",
  "refresh_token_reused",
]);
const SAFE_OAUTH_CODES = new Set([
  ...TERMINAL_REFRESH_CODES,
  "invalid_client",
  "access_denied",
  "temporarily_unavailable",
  "server_error",
  "invalid_request",
  "invalid_scope",
  "unauthorized_client",
]);
const nonempty = z.string().min(1);
const credentialsSchema = z.object({
  idToken: nonempty.optional(),
  accessToken: nonempty.optional(),
  refreshToken: nonempty.optional(),
  expiresAt: z.number().finite().optional(),
  earliestRefreshAt: z.number().finite().optional(),
  nonce: nonempty.optional(),
  scopes: z.array(nonempty),
});
const profileSchema = z.object({
  id: z.uuid(),
  revision: z.number().int().nonnegative(),
  clientId: nonempty.refine((id) => id !== "dynamic_agent_client").optional(),
  subject: nonempty.optional(),
  issuer: z.literal(ISSUER).optional(),
  email: nonempty.optional(),
  credentials: credentialsSchema.optional(),
  pendingRefresh: credentialsSchema
    .refine((credentials) =>
      Boolean(
        credentials.idToken &&
        credentials.accessToken &&
        credentials.refreshToken &&
        credentials.expiresAt,
      ),
    )
    .optional(),
});
const storeSchema = z
  .object({
    version: z.literal(1),
    hostId: z
      .string()
      .regex(
        /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
    activeProfileId: z.uuid().optional(),
    profiles: z.array(profileSchema),
  })
  .refine((store) => {
    const ids = store.profiles.map((profile) => profile.id);
    const clients = store.profiles.flatMap((profile) =>
      profile.clientId ? [profile.clientId] : [],
    );
    return (
      new Set(ids).size === ids.length &&
      new Set(clients).size === clients.length &&
      (!store.activeProfileId ||
        store.profiles.some(
          (profile) => profile.id === store.activeProfileId && profile.subject,
        )) &&
      store.profiles.every(
        (profile) =>
          (!profile.credentials && !profile.pendingRefresh) ||
          (profile.subject && profile.clientId && profile.issuer),
      )
    );
  });
const tokenSchema = z.object({
  access_token: nonempty.optional(),
  refresh_token: nonempty.optional(),
  id_token: nonempty.optional(),
  token_type: nonempty.optional(),
  expires_in: z
    .number()
    .int()
    .positive()
    .max(365 * 86400)
    .optional(),
  scope: z.string().optional(),
  earliest_refresh_at: z
    .union([z.number().finite().nonnegative(), z.iso.datetime()])
    .optional(),
});
export interface ChatGPTModel {
  slug: string;
  display_name: string;
  [key: string]: unknown;
}

type Store = z.infer<typeof storeSchema>;
type Profile = z.infer<typeof profileSchema>;
type Credentials = z.infer<typeof credentialsSchema>;
type Tokens = z.infer<typeof tokenSchema>;

type Options = {
  directory: string;
  fetch?: typeof fetch;
  /** Unix time in milliseconds. */
  now?: () => number;
  /** Trusted key resolver for hermetic tests; production uses OpenAI remote JWKS. */
  jwks?: JWTVerifyGetKey;
  signInTimeoutMs?: number;
  requestTimeoutMs?: number;
};
type SignInOptions = {
  onAuthorizationUrl: (url: string) => void | Promise<void>;
  profileId?: string;
  newProfile?: boolean;
  signal?: AbortSignal;
};

/** Messages and fields are deliberately safe to print; never attach raw HTTP/JWT errors as causes. */
export class ChatGPTAuthError extends Error {
  readonly status?: number;
  readonly code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ChatGPTAuthError";
    this.status = status;
    this.code = code;
  }
}

function failure(message: string): ChatGPTAuthError {
  return new ChatGPTAuthError(message);
}
function isErrno(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}
function sameSecret(actual: string | null, expected: string): boolean {
  if (actual === null) {
    return false;
  }
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function sharing(credentials: Credentials | undefined): boolean {
  return credentials?.scopes.includes(PLAN_SCOPE) ?? false;
}
function requireSharing(credentials: Credentials): void {
  if (!sharing(credentials)) {
    throw failure(
      "ChatGPT plan usage is disabled: the grant lacks plan permission. Sign in again and enable ChatGPT plan usage.",
    );
  }
}

export class ChatGPTAuth {
  private readonly directory: string;
  private readonly filename: string;
  private readonly lockname: string;
  private readonly fetcher: typeof fetch;
  private readonly now: () => number;
  private readonly jwks: JWTVerifyGetKey;
  private readonly signInTimeoutMs: number;
  private readonly requestTimeoutMs: number;
  private operationTail: Promise<void> = Promise.resolve();

  constructor(options: Options) {
    this.directory = resolve(options.directory);
    this.filename = join(this.directory, "chatgpt-auth.json");
    this.lockname = join(this.directory, "chatgpt-auth.lock");
    this.fetcher = options.fetch ?? globalThis.fetch;
    this.now = options.now ?? Date.now;
    this.signInTimeoutMs = options.signInTimeoutMs ?? 5 * 60_000;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 15_000;
    for (const duration of [this.signInTimeoutMs, this.requestTimeoutMs]) {
      if (
        !Number.isSafeInteger(duration) ||
        duration <= 0 ||
        duration > 10 * 60_000
      ) {
        throw failure(
          "ChatGPT authentication timeouts must be between 1 ms and ten minutes.",
        );
      }
    }
    // Official production JWKS: https://developers.openai.com/siwc/website#6-verify-the-id-token
    this.jwks =
      options.jwks ??
      createRemoteJWKSet(new URL(JWKS), {
        timeoutDuration: this.requestTimeoutMs,
        [customFetch]: (url, init) =>
          this.fetcher(url, { ...init, redirect: "error" }),
      });
  }

  async signIn(options: SignInOptions): Promise<void> {
    if (options.profileId && options.newProfile) {
      throw failure(
        "Choose either an existing ChatGPT profile or a new profile, not both.",
      );
    }
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), this.signInTimeoutMs);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout.signal])
      : timeout.signal;
    try {
      if (signal.aborted) {
        throw failure("ChatGPT sign-in was cancelled.");
      }
      const pending = await this.locked(async () => {
        const store = await this.load();
        let profile: Profile | undefined;
        if (!options.newProfile) {
          const id = options.profileId ?? store.activeProfileId;
          profile = id
            ? store.profiles.find((entry) => entry.id === id)
            : store.profiles.length === 1
              ? store.profiles[0]
              : undefined;
          if (options.profileId && !profile) {
            throw failure("ChatGPT profile was not found.");
          }
          if (!id && store.profiles.length > 1) {
            throw failure(
              "Select a ChatGPT profile or explicitly create a new one.",
            );
          }
        }
        if (!profile) {
          profile = { id: randomUUID(), revision: 0 };
          store.profiles.push(profile);
        }
        profile.revision++;
        await this.save(store);
        return { ...profile, hostId: store.hostId };
      });
      const state = randomBytes(32).toString("base64url");
      const nonce = randomBytes(32).toString("base64url");
      const verifier = randomBytes(64).toString("base64url");
      const callback = await this.authorize(
        options.onAuthorizationUrl,
        signal,
        (redirectUri) => {
          const url = new URL(AUTHORIZE);
          url.search = new URLSearchParams({
            client_id: pending.clientId ?? "dynamic_agent_client",
            ext_agent_host_id: pending.hostId,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: SCOPES,
            resource: CHATGPT_RESOURCE,
            state,
            nonce,
            code_challenge_method: "S256",
            code_challenge: createHash("sha256")
              .update(verifier)
              .digest("base64url"),
          }).toString();
          if (!pending.clientId) {
            url.searchParams.set("agent_name_hint", CHATGPT_APP_NAME);
          }
          if (pending.email) {
            url.searchParams.set("login_hint", pending.email);
          }
          // Deliberately omit id_token_hint: callers may print the authorization URL.
          return url.toString();
        },
        state,
      );
      await this.locked(async () => {
        const store = await this.load();
        const profile = store.profiles.find((entry) => entry.id === pending.id);
        if (
          !profile ||
          profile.revision !== pending.revision ||
          store.hostId !== pending.hostId
        ) {
          throw failure(
            "ChatGPT credentials changed while signing in. Start a fresh sign-in.",
          );
        }
        if (signal.aborted) {
          throw failure("ChatGPT sign-in was cancelled.");
        }
        const clientId = callback.clientId ?? pending.clientId;
        if (
          !clientId ||
          clientId === "dynamic_agent_client" ||
          (pending.clientId && clientId !== pending.clientId)
        ) {
          throw failure(
            "ChatGPT callback has a missing or changed issued client ID. Start a fresh sign-in.",
          );
        }
        if (
          store.profiles.some(
            (entry) => entry.id !== profile.id && entry.clientId === clientId,
          )
        ) {
          throw failure(
            "That ChatGPT client is already associated with a different saved profile.",
          );
        }
        // The server has already created the client, even if code exchange fails.
        profile.clientId = clientId;
        await this.save(store);
        const tokens = await this.grant(
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            code: callback.code,
            code_verifier: verifier,
            redirect_uri: callback.redirectUri,
            resource: CHATGPT_RESOURCE,
          }),
          false,
          signal,
        );
        if (!tokens.id_token) {
          throw failure(
            "ChatGPT did not return an ID token. Start a fresh sign-in.",
          );
        }
        const identity = await this.identity(tokens.id_token, clientId, {
          nonce,
          subject: pending.subject,
        });
        if (signal.aborted) {
          throw failure("ChatGPT sign-in was cancelled.");
        }
        profile.subject = identity.subject;
        profile.email = identity.email;
        profile.issuer = ISSUER;
        profile.credentials = this.credentials(tokens, undefined, nonce);
        delete profile.pendingRefresh;
        profile.revision++;
        store.activeProfileId = profile.id;
        await this.save(store);
      });
    } catch (error) {
      if (signal.aborted) {
        throw failure(
          options.signal?.aborted
            ? "ChatGPT sign-in was cancelled."
            : "ChatGPT sign-in timed out. Start a fresh sign-in.",
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async getAccessToken(): Promise<string> {
    // Read *inside* the cross-process lock. A cached token set can contain a
    // refresh token already consumed by another process after rotation.
    return this.locked(async () => {
      const store = await this.load();
      const profile = store.profiles.find(
        (entry) => entry.id === store.activeProfileId,
      );
      if (!profile?.credentials || !profile.clientId || !profile.subject) {
        throw failure("Sign in with ChatGPT before making requests.");
      }
      await this.acceptPendingRefresh(store, profile);
      let credentials = profile.credentials;
      requireSharing(credentials);
      if (
        credentials.accessToken &&
        (credentials.expiresAt ?? 0) > this.now() + MIN_VALIDITY_MS
      ) {
        return credentials.accessToken;
      }
      if (!credentials.refreshToken) {
        throw failure("ChatGPT session cannot be refreshed. Sign in again.");
      }
      if ((credentials.earliestRefreshAt ?? 0) > this.now()) {
        throw failure(
          "ChatGPT token needs more validity, but refresh is not permitted yet. Try again later.",
        );
      }
      let tokens: Tokens;
      try {
        tokens = await this.grant(
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: profile.clientId,
            refresh_token: credentials.refreshToken,
            resource: CHATGPT_RESOURCE,
          }),
          true,
        );
      } catch (error) {
        // Never discard on invalid_client, transport failures, or 5xx responses.
        // https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery#refresh-errors
        if (
          error instanceof ChatGPTAuthError &&
          (error.status === 400 || error.status === 401) &&
          error.code &&
          TERMINAL_REFRESH_CODES.has(error.code)
        ) {
          delete profile.credentials;
          profile.revision++;
          await this.save(store);
        }
        throw error;
      }
      const replacement = this.credentials(tokens, credentials);
      if (tokens.id_token) {
        // The token endpoint has already consumed the old refresh token. Save
        // its replacement before a potentially unavailable JWKS fetch, but do
        // not allow inference until the replacement identity is verified.
        profile.pendingRefresh = replacement;
        profile.revision++;
        await this.save(store);
        await this.acceptPendingRefresh(store, profile);
      } else {
        profile.credentials = replacement;
        profile.revision++;
        await this.save(store);
      }
      credentials = profile.credentials;
      requireSharing(credentials);
      if (
        !credentials.accessToken ||
        (credentials.expiresAt ?? 0) <= this.now() + MIN_VALIDITY_MS
      ) {
        throw failure(
          "ChatGPT returned a token with insufficient validity for a five-minute run. Try refreshing later.",
        );
      }
      return credentials.accessToken;
    });
  }

  async listModels(): Promise<Array<{ slug: string; display_name: string }>> {
    const { models } = await this.getInferenceSession();
    return models.map(({ slug, display_name }) => ({ slug, display_name }));
  }

  async getInferenceSession(): Promise<{
    accessToken: string;
    models: ChatGPTModel[];
  }> {
    // Snapshot the credential once. An account switch during model discovery
    // must not pair the previous account's catalog with the new account's token.
    const accessToken = await this.getAccessToken();
    const response = await this.request(`${CHATGPT_RESOURCE}/models`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    });
    if (response.status !== 200) {
      throw new ChatGPTAuthError(
        `ChatGPT model listing failed (HTTP ${response.status}).`,
        response.status,
      );
    }
    const parsed = z
      .object({
        models: z.array(
          z
            .object({
              slug: nonempty,
              display_name: nonempty,
              visibility: z.string().optional(),
            })
            .passthrough(),
        ),
      })
      .safeParse(await this.json(response));
    if (!parsed.success) {
      throw failure("ChatGPT returned an invalid model catalog.");
    }
    // https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
    return {
      accessToken,
      models: parsed.data.models.filter((model) => model.visibility === "list"),
    };
  }

  async listProfiles(): Promise<
    Array<{
      id: string;
      email?: string;
      subject?: string;
      active: boolean;
      connected: boolean;
      sharing: boolean;
    }>
  > {
    return this.locked(async () => {
      const store = await this.load();
      return store.profiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        subject: profile.subject,
        active: profile.id === store.activeProfileId,
        connected: Boolean(profile.credentials),
        sharing: sharing(profile.credentials),
      }));
    });
  }

  async selectProfile(id: string): Promise<void> {
    await this.locked(async () => {
      const store = await this.load();
      const profile = store.profiles.find((entry) => entry.id === id);
      if (!profile) {
        throw failure("ChatGPT profile was not found.");
      }
      if (!profile.credentials || !profile.subject) {
        throw failure(
          "That ChatGPT profile is not connected. Sign in to it first.",
        );
      }
      store.activeProfileId = id;
      await this.save(store);
    });
  }

  async signOut(): Promise<{ revoked: boolean }> {
    return this.locked(async () => {
      const store = await this.load();
      const profile = store.profiles.find(
        (entry) => entry.id === store.activeProfileId,
      );
      if (!profile) {
        return { revoked: true };
      }
      const credentials = profile.pendingRefresh ?? profile.credentials;
      let revoked = !credentials;
      try {
        if (credentials?.refreshToken && profile.clientId) {
          const discovery = await this.request(DISCOVERY, {
            method: "GET",
            headers: { accept: "application/json" },
          });
          const parsed = z
            .object({ issuer: z.literal(ISSUER), revocation_endpoint: z.url() })
            .safeParse(await this.json(discovery));
          if (discovery.status === 200 && parsed.success) {
            const endpoint = new URL(parsed.data.revocation_endpoint);
            // Discovery cannot redirect a credential-bearing POST to another host.
            if (
              endpoint.origin === ISSUER &&
              !endpoint.username &&
              !endpoint.password &&
              !endpoint.hash &&
              !endpoint.search
            ) {
              const response = await this.request(endpoint.toString(), {
                method: "POST",
                headers: {
                  "content-type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  token: credentials.refreshToken,
                  token_type_hint: "refresh_token",
                  client_id: profile.clientId,
                }),
              });
              revoked = response.status === 200;
            }
          }
        }
      } catch {
        // Bounded best effort: no background retries retaining a signed-out token.
        // The caller must report unconfirmed revocation and link ChatGPT Settings.
        revoked = false;
      } finally {
        delete profile.credentials;
        delete profile.pendingRefresh;
        profile.revision++;
        await this.save(store);
      }
      return { revoked };
    });
  }

  private async acceptPendingRefresh(
    store: Store,
    profile: Profile,
  ): Promise<void> {
    const pending = profile.pendingRefresh;
    if (!pending) {
      return;
    }
    const identity = await this.identity(pending.idToken!, profile.clientId!, {
      subject: profile.subject,
      refreshNonce: pending.nonce,
    });
    profile.email = identity.email ?? profile.email;
    profile.credentials = pending;
    delete profile.pendingRefresh;
    profile.revision++;
    await this.save(store);
  }

  private async identity(
    idToken: string,
    clientId: string,
    expected: { nonce?: string; subject?: string; refreshNonce?: string },
  ): Promise<{ subject: string; email?: string }> {
    try {
      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: ISSUER,
        audience: clientId,
        algorithms: ["RS256", "ES256"],
        requiredClaims: ["sub", "exp", "iat"],
        currentDate: new Date(this.now()),
        clockTolerance: 5,
      });
      if (
        typeof payload.sub !== "string" ||
        !payload.sub.trim() ||
        (expected.nonce !== undefined && payload.nonce !== expected.nonce) ||
        (expected.refreshNonce !== undefined &&
          payload.nonce !== undefined &&
          payload.nonce !== expected.refreshNonce) ||
        (expected.subject !== undefined && payload.sub !== expected.subject) ||
        (payload.azp !== undefined && payload.azp !== clientId) ||
        (Array.isArray(payload.aud) &&
          payload.aud.length > 1 &&
          payload.azp !== clientId) ||
        (payload.sid !== undefined &&
          (typeof payload.sid !== "string" || !payload.sid.trim()))
      ) {
        throw failure("Invalid identity claims.");
      }
      return {
        subject: payload.sub,
        email:
          typeof payload.email === "string" && payload.email
            ? payload.email
            : undefined,
      };
    } catch {
      throw failure(
        "ChatGPT ID token or returning account identity could not be verified. Start a fresh sign-in.",
      );
    }
  }

  private credentials(
    tokens: Tokens,
    previous?: Credentials,
    nonce?: string,
  ): Credentials {
    const scopes =
      tokens.scope === undefined
        ? (previous?.scopes ?? [])
        : [...new Set(tokens.scope.split(/\s+/).filter(Boolean))];
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token ?? previous?.idToken,
      nonce: nonce ?? previous?.nonce,
      scopes,
      expiresAt:
        tokens.expires_in === undefined
          ? undefined
          : this.now() + tokens.expires_in * 1000,
      earliestRefreshAt:
        tokens.earliest_refresh_at === undefined
          ? undefined
          : typeof tokens.earliest_refresh_at === "number"
            ? tokens.earliest_refresh_at * 1000
            : Date.parse(tokens.earliest_refresh_at),
    };
  }

  private async grant(
    body: URLSearchParams,
    refresh: boolean,
    signal?: AbortSignal,
  ): Promise<Tokens> {
    const response = await this.request(
      TOKEN,
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body,
      },
      signal,
    );
    const data = await this.json(response);
    if (response.status !== 200) {
      const parsed = z
        .object({
          error: z.union([z.string(), z.object({ code: z.string() })]),
        })
        .safeParse(data);
      const rawCode = parsed.success
        ? typeof parsed.data.error === "string"
          ? parsed.data.error
          : parsed.data.error.code
        : undefined;
      const code =
        rawCode && SAFE_OAUTH_CODES.has(rawCode) ? rawCode : undefined;
      const recovery =
        code === "invalid_client"
          ? " Check the client configuration."
          : code && TERMINAL_REFRESH_CODES.has(code)
            ? " Sign in again using the saved profile."
            : " Try again later; saved credentials have been preserved.";
      throw new ChatGPTAuthError(
        `ChatGPT ${refresh ? "token refresh" : "code exchange"} failed (HTTP ${response.status}${code ? `; ${code}` : ""}).${recovery}`,
        response.status,
        code,
      );
    }
    const parsed = tokenSchema.safeParse(data);
    if (!parsed.success) {
      throw failure(
        "ChatGPT returned an invalid token response; saved credentials have been preserved.",
      );
    }
    const tokens = parsed.data;
    if (
      (tokens.access_token &&
        (!tokens.expires_in ||
          tokens.token_type?.toLowerCase() !== "bearer")) ||
      (refresh && (!tokens.access_token || !tokens.refresh_token)) ||
      (!refresh &&
        tokens.scope?.split(/\s+/).includes(PLAN_SCOPE) &&
        !tokens.access_token)
    ) {
      throw failure(
        "ChatGPT returned an incomplete token response; saved credentials have been preserved.",
      );
    }
    return tokens;
  }

  private async request(
    url: string,
    init: RequestInit,
    signal?: AbortSignal,
  ): Promise<Response> {
    try {
      const deadline = AbortSignal.timeout(this.requestTimeoutMs);
      return await this.fetcher(url, {
        ...init,
        redirect: "error",
        signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
      });
    } catch {
      throw failure(
        "ChatGPT request failed or timed out. Check connectivity and try again; saved credentials have been preserved.",
      );
    }
  }

  private async json(response: Response): Promise<unknown> {
    try {
      return (await response.json()) as unknown;
    } catch {
      return undefined;
    }
  }

  private async authorize(
    publish: SignInOptions["onAuthorizationUrl"],
    signal: AbortSignal,
    makeUrl: (redirectUri: string) => string,
    state: string,
  ): Promise<{ code: string; clientId?: string; redirectUri: string }> {
    return new Promise((resolveCallback, rejectCallback) => {
      let finished = false;
      let redirectUri = "";
      const server = createServer((request, response) => {
        response.setHeader("cache-control", "no-store");
        response.setHeader("content-type", "text/plain; charset=utf-8");
        response.setHeader(
          "content-security-policy",
          "default-src 'none'; frame-ancestors 'none'",
        );
        response.setHeader("referrer-policy", "no-referrer");
        // Compare the raw path before URL parsing can normalize dot segments.
        if (
          request.url?.split("?", 1)[0] !== "/auth/callback" ||
          request.url.includes("#")
        ) {
          response.writeHead(404).end("Not found.");
          return;
        }
        const url = new URL(request.url, redirectUri);
        if (
          request.method !== "GET" ||
          url.pathname !== "/auth/callback" ||
          request.headers.host !== new URL(redirectUri).host
        ) {
          response.writeHead(404).end("Not found.");
          return;
        }
        let error: ChatGPTAuthError | undefined;
        let result:
          | { code: string; clientId?: string; redirectUri: string }
          | undefined;
        const params = url.searchParams;
        if ([...params.keys()].some((key) => params.getAll(key).length !== 1)) {
          error = failure(
            "ChatGPT callback contains duplicate parameters. Start a fresh sign-in.",
          );
        } else if (!sameSecret(params.get("state"), state)) {
          error = failure(
            "ChatGPT callback state could not be verified. Start a fresh sign-in.",
          );
        } else if (params.has("error")) {
          error = failure(
            params.get("error") === "access_denied"
              ? "ChatGPT authorization was denied. Enable ChatGPT plan usage to continue."
              : "ChatGPT authorization failed. Start a fresh sign-in.",
          );
        } else if (!params.get("code")) {
          error = failure(
            "ChatGPT callback is missing its authorization code. Start a fresh sign-in.",
          );
        } else {
          result = {
            code: params.get("code")!,
            clientId: params.get("client_id") ?? undefined,
            redirectUri,
          };
        }
        response.once("finish", () => finish(error, result));
        response
          .writeHead(error ? 400 : 200)
          .end(
            error
              ? "Sign-in could not be completed. Return to the application."
              : "Authorization received. Return to the application.",
          );
      });
      server.requestTimeout = 5000;
      server.headersTimeout = 5000;
      server.keepAliveTimeout = 1;
      server.maxConnections = 16;
      const abort = () =>
        finish(failure("ChatGPT sign-in was cancelled or timed out."));
      const finish = (
        error?: ChatGPTAuthError,
        result?: { code: string; clientId?: string; redirectUri: string },
      ) => {
        if (finished) {
          return;
        }
        finished = true;
        signal.removeEventListener("abort", abort);
        server.close(() => {
          if (error) {
            rejectCallback(error);
          } else if (result) {
            resolveCallback(result);
          }
        });
        server.closeAllConnections();
      };
      server.once("error", () =>
        finish(
          failure("Could not start the ChatGPT loopback callback listener."),
        ),
      );
      signal.addEventListener("abort", abort, { once: true });
      server.listen(0, "127.0.0.1", () => {
        if (finished) {
          server.close();
          return;
        }
        const address = server.address();
        if (!address || typeof address === "string") {
          finish(
            failure("Could not determine the ChatGPT loopback callback port."),
          );
          return;
        }
        redirectUri = `http://127.0.0.1:${address.port}/auth/callback`;
        void Promise.resolve()
          .then(() => publish(makeUrl(redirectUri)))
          .catch(() =>
            finish(
              failure(
                "Could not present the ChatGPT authorization URL. Start a fresh sign-in.",
              ),
            ),
          );
      });
      if (signal.aborted) {
        abort();
      }
    });
  }

  private locked<T>(operation: () => Promise<T>): Promise<T> {
    // Concurrent AG-UI runs share this manager. Queue locally without polling;
    // the file lock still rejects competing *processes* before rotating tokens.
    const result = this.operationTail.then(() => this.exclusive(operation));
    this.operationTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const directory = await lstat(this.directory);
    if (
      !directory.isDirectory() ||
      (process.getuid && directory.uid !== process.getuid())
    ) {
      throw failure(
        "ChatGPT credential storage must be an owned directory, not a symlink.",
      );
    }
    await chmod(this.directory, 0o700);
    let lock;
    try {
      lock = await open(this.lockname, "wx", 0o600);
    } catch (error) {
      if (isErrno(error, "EEXIST")) {
        throw failure(
          `Another ChatGPT credential operation is in progress. Retry after it finishes. If it crashed, verify no process uses this directory before removing ${this.lockname}.`,
        );
      }
      throw failure(
        "Cannot lock ChatGPT credential storage. Check directory permissions.",
      );
    }
    try {
      await lock.writeFile(`${process.pid}\n`);
      return await operation();
    } finally {
      await lock.close();
      await rm(this.lockname);
    }
  }

  private async load(): Promise<Store> {
    let file;
    try {
      file = await open(
        this.filename,
        constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
      );
    } catch (error) {
      if (!isErrno(error, "ENOENT")) {
        throw failure(
          "Cannot read ChatGPT credential storage. Refusing to replace it.",
        );
      }
      const store: Store = {
        version: 1,
        hostId: `urn:uuid:${randomUUID()}`,
        profiles: [],
      };
      await this.save(store);
      return store;
    }
    try {
      const stat = await file.stat();
      if (
        !stat.isFile() ||
        stat.nlink !== 1 ||
        stat.size > 4 * 1024 * 1024 ||
        (process.getuid && stat.uid !== process.getuid())
      ) {
        throw failure(
          "ChatGPT credential storage is not a private regular file.",
        );
      }
      await file.chmod(0o600);
      let value: unknown;
      try {
        value = JSON.parse(await file.readFile("utf8")) as unknown;
      } catch {
        throw failure(
          "ChatGPT credential storage is corrupt. Refusing to replace it.",
        );
      }
      const parsed = storeSchema.safeParse(value);
      if (!parsed.success) {
        throw failure(
          "ChatGPT credential storage is invalid. Refusing to replace it.",
        );
      }
      return parsed.data;
    } finally {
      await file.close();
    }
  }

  private async save(store: Store): Promise<void> {
    const temporary = `${this.filename}.${randomUUID()}.tmp`;
    try {
      const file = await open(temporary, "wx", 0o600);
      try {
        await file.writeFile(`${JSON.stringify(store)}\n`, "utf8");
        await file.sync();
      } finally {
        await file.close();
      }
      await rename(temporary, this.filename);
    } finally {
      await rm(temporary, { force: true });
    }
  }
}
