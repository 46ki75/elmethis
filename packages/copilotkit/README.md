# CopilotKit Codex backend

The backend adapts the official [Codex app-server](https://learn.chatgpt.com/codex/app-server)
to AG-UI using **Sign in with ChatGPT (SIWC) for ChatGPT plan usage**, not API-key
billing. Elmethis owns OAuth login, protected token storage, and refresh. It passes
the active account's access token to an app-server child process configured with
a custom provider for the public `https://api.openai.com/v1/responses` endpoint.
The Codex executable is pinned because its dynamic-tool API is experimental.

This integration follows OpenAI's [ChatGPT plan usage documentation](https://developers.openai.com/siwc/token-sharing-open-source)
and [SIWC app-server configuration](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server).
It is not the old Codex-managed subscription login. No live SIWC OAuth or inference
verification is claimed; automated checks use injected dependencies and local mocks.

## Run locally

After the root [setup](../../README.md#setup-and-tasks):

```sh
mise run --silent copilotkit:login
mise run --silent copilotkit:dev
```

Open the printed **Continue with ChatGPT** URL on the machine running login and
complete sign-in, account/workspace registration, and consent to use your ChatGPT
plan. Login uses authorization-code PKCE and a localhost loopback callback;
Ctrl+C aborts the pending flow and closes its callback listener. There is no device
authorization flow. The compatibility command `codex:login` still exists, but now
runs Elmethis SIWC login, not `codex login`. The standalone interactive Codex CLI
is not a supported login path for this integration.

### Migrate and manage accounts

**Sign in again after upgrading.** An old Codex `auth.json` is not a SIWC
registration and is not imported. Existing credentials do not grant this app
permission to use your ChatGPT plan. The routes and replay-based client contract
below are unchanged.

```sh
# Reuse the selected/saved registration (or register on first sign-in).
mise run --silent copilotkit:login

# The npm script remains available; choose exactly one action per invocation.
mise exec -- pnpm --filter backend run codex:login --help
mise exec -- pnpm --filter backend run codex:login --new-account
mise exec -- pnpm --filter backend run codex:login --list
mise exec -- pnpm --filter backend run codex:login --account ACCOUNT_ID
mise exec -- pnpm --filter backend run codex:login --select ACCOUNT_ID
mise exec -- pnpm --filter backend run codex:login --models
mise exec -- pnpm --filter backend run codex:login --logout
```

`--new-account` creates a separate registration; `--account ID` reauthorizes that
saved registration; `--select ID` switches accounts without starting browser
login. Registrations stay distinct even when their email addresses match.
`--list` shows stable IDs, the active account, connection state, and whether
ChatGPT plan usage is enabled. `--logout` clears the selected account's local
tokens and attempts renewable-session revocation while retaining its registration
for later login. If remote revocation is not confirmed, disconnect the app in
ChatGPT Settings. The CLI prints account/plan state and a
[Manage usage](https://chatgpt.com/settings/usage) link, never tokens. Authorization
URLs printed by the helper omit credential-bearing `id_token_hint` values.

### Configuration and credential storage

No `.env` is required. Optional settings are listed in `.env.example`; copy it to
`.env` if needed. `--models` reads the active account's visible `/v1/models`
catalog in server order. By default the backend selects the **first visible model**
in that order; set `CODEX_MODEL` to explicitly choose a slug from that catalog.
Switching accounts changes the catalog. A catalog entry is not proof that an
inference request will succeed: model/account policy and subscription usage
limits still apply. There is **no automatic fallback to OpenAI API billing**.
Old Anthropic environment variables are unused; inherited `OPENAI_API_KEY` and
`CODEX_API_KEY` are removed from the child process.

The dedicated runtime directory defaults to
`~/.local/share/elmethis/copilotkit-codex`. Override it with
`COPILOTKIT_CODEX_HOME` **for both login and serving**. The private SIWC store is
`<COPILOTKIT_CODEX_HOME>/siwc`; it holds the app's saved registrations, persistent
host identity, and OAuth credentials, including refresh tokens. Elmethis, not
Codex, manages those tokens and refreshes. Rotated tokens awaiting ID-token
verification remain protected and cannot be used for inference until verification
succeeds. This deliberately does not reuse your personal `~/.codex` configuration
or legacy `auth.json`.

Concurrent runs in one backend serialize credential operations. Other processes
fail promptly if the store is locked, rather than racing a rotating refresh
token. A crashed process can leave `siwc/chatgpt-auth.lock`; remove it only after
verifying that no login or backend process still uses that store.

Keep the directory private and user-controlled. Do not commit it, bake it into an
image, expose it through logs/browser storage, or put personal plugins, MCP
servers, or configuration in it. Persistent credentials are separate from the
ephemeral chat threads described below. See OpenAI's
[accounts and sessions guidance](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions)
for token security and revocation.

## Endpoints and behavior

- Chat: `http://localhost:19101/copilotkit/codex/agent/default/run`
- Wordle (unchanged): `http://localhost:19101/copilotkit/wordle/agent/default/run`
- Weather MCP (unchanged): `http://localhost:19101/mcp`

The old `/copilotkit/claude/agent/{opus,sonnet,haiku}/run` routes are removed.
The Solid `useAgent` story points to the new endpoint; select its `http` scenario
for a live run.

The adapter retains text streaming, text/image input, frontend tools (including
A2UI), application context/state, and local AWS Knowledge MCP integration. The
former Claude-specific research subagent remains removed.

The pinned Codex process receives a temporary model catalog derived from the
account's selected model. It preserves returned model metadata and selects
Codex's Responses Lite serialization so tools use `additional_tools` input,
not unsupported top-level function tools. Native `tool_search` is disabled.
These wire-format constraints are regression-tested with the real executable;
they do not prove live model entitlement or tool availability. The temporary
catalog contains no credentials and is removed when its connection closes.

**Compatibility limitation:** this pinned Codex transport omits hosted web search,
even though SIWC itself supports it. Native web search is explicitly disabled;
we do not opt into Codex's separate, undocumented-for-SIWC `/v1/alpha/search`
endpoint. AWS Knowledge MCP, frontend tools, and shared-state tools remain
available.

Current image restrictions are unchanged. Codex requires inline images; the
adapter downloads public HTTP(S) images and converts them to data URLs.
PNG/JPEG/WebP/GIF images are limited to 5 MiB each, 20 images and 20 MiB total per
run, with at most four concurrent resolutions. Remote downloads allow three
redirects and a 10-second total deadline. Private/local network destinations are
rejected. Audio/video/document input and interactive Codex approvals are not
supported; unsupported requests fail explicitly rather than granting permissions.

Shared state emits an initial `STATE_SNAPSHOT` and can be updated through the
reserved `ag_ui_update_state` tool, which uses a private native namespace for
SIWC. Its `state_updates` object shallow-merges top-level keys; validated changes
emit snapshots without handing execution to the browser. Frontend tools must not
use this reserved name.

Each AG-UI run creates an ephemeral Codex thread and replays the supplied message
history. Clients must include current application context on every run, including
tool continuations; the Solid `useAgent` hook does this automatically. A response
containing frontend tools hands off its complete tool batch, including shared-state
updates, before ending the run. The browser executes those tools; the next run
replays their structured calls/results. Pending or queued backend MCP calls receive
explicit cancellation results rather than disappearing at handoff.
Frontend tools use a private native namespace and deterministic aliases for
reserved or Codex-incompatible names, so built-ins cannot shadow them; frontend
AG-UI names remain unchanged.
Backend tool notifications use noncolliding aliases when necessary.
Clients should preserve tool-call metadata when replaying history, including
after a tool is removed from the current registry. This works across CopilotKit
clones and backend restarts without keeping native sessions alive. MCP replay
preserves the exact native function name and namespace, including Codex's name
normalization. Batch boundaries and native tool identities use pinned experimental
raw events; raw messages and private reasoning are never forwarded.
Native reasoning/session checkpoints are not preserved. Shell, code-mode,
apps, hooks, and subagents are disabled; turns have restricted read-only access.
Processes are closed on completion, cancellation, error, or a five-minute timeout.
Disconnecting a live run's HTTP stream cancels that run; replay/connect streams
do not own or cancel runs.

This is a local development backend, not an authenticated or pooled multiuser
service. It binds to `127.0.0.1` by default. Do not expose it publicly: anyone with
access could consume your ChatGPT plan and invoke the configured tools. Each user
must control their own credentials; do not pool registrations or provide a
general-purpose API proxy for unrelated tools.

OpenAI's documented OSS flow is for open-source, locally hosted apps. Paid or
remotely hosted offerings require following OpenAI's separate process; see the
[SIWC overview and interest form](https://developers.openai.com/siwc/token-sharing-open-source)
and the [Sign in with ChatGPT Terms](https://openai.com/policies/sign-in-with-chatgpt-terms/).
The terms require users to be able to use their ChatGPT plan through SIWC without
paying the app developer or upgrading to a paid app version. Do not interpret
this local backend or container example as permission to offer a paid/hosted SIWC
service.

## Verify

```sh
mise run --silent copilotkit:check
```

`check` builds the backend and runs CLI/auth, adapter/transport, HTTP cancellation,
and pinned-binary regression tests; it does not require real credentials or spend
subscription usage. Native tests use fresh temporary stores with AWS MCP disabled
and simulated completion or a local mock inference server. These are not live
SIWC verification. A live chat still requires a new SIWC login and an eligible
account/model.

## Container

Build with the existing package command after building the backend:

```sh
mise exec -- pnpm --filter backend run build:container
```

The image installs the pinned Codex executable for its target architecture and
runs as the `node` user. **Do not run `node login.mjs --device-auth`: device auth
has been replaced and is not supported.** Complete SIWC login on your local host
first, then mount the protected runtime directory **read-write** at
`/home/node/.codex-copilotkit`, including its `siwc` subdirectory. For example,
after local login with the default directory:

```sh
docker run --rm \
  -p 127.0.0.1:19101:8080 \
  --mount "type=bind,src=$HOME/.local/share/elmethis/copilotkit-codex,dst=/home/node/.codex-copilotkit" \
  copilotkit-minimal
```

The mount must be private and writable by the container's `node` user, not merely
by your host user; check ownership/UID permissions before starting. Do not solve
permission errors by making credentials world-readable. Keep the same volume
for later runs so the app can persist refreshed tokens. Let one runtime own the
session's refreshes rather than running independent host/container refreshers
against copied rotating credentials. Never bake credentials into the image.

A browser's `127.0.0.1` callback reaches the **browser machine**, not a remote
container or VM. Running the login command on a remote host and opening its URL
on your laptop is not a headless-login replacement. For a separate self-hosted
VM, follow OpenAI's [self-hosted VM guidance](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms):
transfer protected credentials over a secure channel, preserve the VM's own
persistent host identity rather than overwriting it with the laptop's, and let
the VM manage later refreshes. The bind-mount example above is a single-user,
local-host workflow, not a credential-import tool or a hosted multiuser service.
Publish port 8080 on loopback only, as shown.
