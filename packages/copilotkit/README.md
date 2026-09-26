# CopilotKit Codex backend

The backend adapts the official [Codex app-server](https://learn.chatgpt.com/codex/app-server)
to AG-UI using a **ChatGPT/Codex subscription**, not OpenAI API billing. Codex owns
OAuth login, token storage, and refresh. The CLI version is pinned because its
dynamic-tool API is experimental.

## Run locally

After the root [setup](../../README.md#setup-and-tasks):

```sh
mise run copilotkit:login
mise run copilotkit:dev
```

Complete the browser login with the ChatGPT account whose subscription you want
to use. For headless login:

```sh
mise exec -- pnpm --filter backend run codex:login --device-auth
```

No `.env` is required. Optional settings are listed in `.env.example`; copy it to
`.env` if needed. `CODEX_MODEL` selects an account-supported model; otherwise
Codex chooses its default. Old Anthropic environment variables are unused.
Inherited `OPENAI_API_KEY` and `CODEX_API_KEY` are removed from the child process,
and the adapter rejects any account that is not authenticated with ChatGPT.
Subscription usage limits still apply.

The dedicated login directory defaults to
`~/.local/share/elmethis/copilotkit-codex`. Override it with
`COPILOTKIT_CODEX_HOME` **for both login and serving**. This deliberately does not
reuse your personal `~/.codex` configuration. Keep this directory private: it
contains OAuth credentials. Do not commit it or put personal plugins, MCP
servers, or configuration in it.

## Endpoints and behavior

- Chat: `http://localhost:19101/copilotkit/codex/agent/default/run`
- Wordle (unchanged): `http://localhost:19101/copilotkit/wordle/agent/default/run`
- Weather MCP (unchanged): `http://localhost:19101/mcp`

The old `/copilotkit/claude/agent/{opus,sonnet,haiku}/run` routes are removed.
The Solid `useAgent` story points to the new endpoint; select its `http` scenario
for a live run.

Text streaming, text/image input, frontend tools (including A2UI), application
context/state, AWS Knowledge MCP, and web search are supported. Codex requires
inline images; the adapter downloads public HTTP(S) images and converts them to
data URLs. PNG/JPEG/WebP/GIF images are limited to 5 MiB each, 20 images and
20 MiB total per run, with at most four concurrent resolutions. Remote downloads
allow three redirects and a 10-second total deadline. Private/local network
destinations are rejected. The former Claude-specific research subagent is replaced by direct
Codex web search and AWS Knowledge tools. Audio/video/document input and interactive Codex approvals
are not supported; unsupported requests fail explicitly rather than granting
permissions.

Shared state emits an initial `STATE_SNAPSHOT` and can be updated through the
reserved `ag_ui_update_state` tool. Its `state_updates` object shallow-merges
top-level keys; validated changes emit snapshots without handing execution to
the browser. Frontend tools must not use this reserved name.

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

This is a local development backend, not an authenticated multiuser service.
It binds to `127.0.0.1` by default. Do not expose it publicly: anyone with access
could consume your subscription and invoke the configured tools.

## Verify

```sh
mise run copilotkit:check
mise run copilotkit:build
```

`check` includes adapter/transport, HTTP cancellation, and pinned-binary regression
tests; it does not require credentials or spend subscription usage. Native tests
use fresh temporary login stores with AWS MCP disabled and simulated completion
or a local mock inference server. A live chat still requires login.

## Container

Build with the existing package command after building the backend:

```sh
mise exec -- pnpm --filter backend run build:container
```

The image installs the pinned Codex executable for its target architecture and
runs as the `node` user. Mount a private, writable volume at
`/home/node/.codex-copilotkit`, then initialize it with
`node login.mjs --device-auth` inside the container before starting the server.
Use the same volume for subsequent runs so Codex can refresh credentials. Publish
port 8080 on loopback only (for example, `-p 127.0.0.1:19101:8080`). Never bake
credentials into the image.
