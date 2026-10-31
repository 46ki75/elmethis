import { ChatGPTAuthError } from "./chatgpt-auth.ts";

export interface ChatGPTProfile {
  id: string;
  email?: string;
  subject?: string;
  active: boolean;
  connected: boolean;
  sharing: boolean;
}

// Deliberately excludes token access: neither commands nor diagnostics need it.
export interface ChatGPTCLIAuth {
  signIn(options: {
    onAuthorizationUrl: (url: string) => void | Promise<void>;
    profileId?: string;
    newProfile?: boolean;
    signal?: AbortSignal;
  }): Promise<void>;
  listProfiles(): Promise<ChatGPTProfile[]>;
  selectProfile(id: string): Promise<void>;
  signOut(): Promise<{ revoked: boolean }>;
  listModels(): Promise<Array<{ slug: string; display_name: string }>>;
}

interface Output {
  log: (message: string) => void;
  error: (message: string) => void;
}

interface Dependencies {
  auth: ChatGPTCLIAuth | (() => ChatGPTCLIAuth | Promise<ChatGPTCLIAuth>);
  output: Output;
  signal?: AbortSignal;
}

type Command =
  | { action: "signIn"; profileId?: string; newProfile?: boolean }
  | { action: "select"; profileId: string }
  | { action: "list" | "logout" | "models" | "help" };

const manageUsage = "Manage usage: https://chatgpt.com/settings/usage";
const help = `Continue with ChatGPT — Elmethis CopilotKit

Usage: mise run --silent copilotkit:login [-- one-action]
   or: mise exec -- pnpm --filter backend run codex:login [one action]

  (no arguments)   Sign in using the selected/saved registration
  --new-account   Register another ChatGPT account/workspace
  --account ID    Reauthorize a saved account registration
  --list          List saved accounts and their connection/plan state
  --select ID     Switch the active saved account without browser sign-in
  --logout        Sign out the active account; retain its registration
  --models        List the active account's visible model catalog
  --help          Show this help

Sign-in uses browser PKCE with a localhost loopback callback. Open the printed
Continue with ChatGPT URL on this machine. Ctrl+C cancels pending sign-in.
Old Codex auth.json is not a SIWC login; sign in again after migration.
Device authorization is not supported. For containers, sign in on your local
browser machine and mount protected credentials read-write for the node user.
No automatic API-billing fallback is used.
${manageUsage}`;

function parse(args: string[]): Command | string {
  if (args.includes("--device-auth")) {
    return "Device authorization (--device-auth) is not supported by Sign in with ChatGPT. Sign in on your local browser machine, then mount protected credentials read-write when using a container. See --help.";
  }
  if (args.length === 0) {
    return { action: "signIn" };
  }
  const [flag, id] = args;
  if (flag === "--account" || flag === "--select") {
    if (!id || !id.trim() || id.startsWith("-")) {
      return `${flag} requires a saved account ID. Use --list to find it; see --help.`;
    }
    if (args.length === 2) {
      return flag === "--account"
        ? { action: "signIn", profileId: id }
        : { action: "select", profileId: id };
    }
  } else if (args.length === 1) {
    switch (flag) {
      case "--new-account":
        return { action: "signIn", newProfile: true };
      case "--list":
        return { action: "list" };
      case "--logout":
        return { action: "logout" };
      case "--models":
        return { action: "models" };
      case "--help":
      case "-h":
        return { action: "help" };
    }
  }
  // Never echo arbitrary arguments: a mistaken command may contain credentials.
  return "Unrecognized or conflicting arguments. Choose exactly one action; see --help.";
}

function label(value: string): string {
  return JSON.stringify(value)
    .slice(1, -1)
    .replace(
      /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu,
      (character) =>
        `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
    );
}

function safeAuthorizationUrl(value: string): string {
  const url = new URL(value);
  if (
    url.origin !== "https://auth.openai.com" ||
    url.username ||
    url.password
  ) {
    throw new Error("Unexpected authorization URL");
  }
  // Auth supplies a display URL without id_token_hint. Defend that boundary
  // here too, so future changes cannot accidentally log a retained credential.
  for (const name of [...url.searchParams.keys()]) {
    if (
      [
        "id_token_hint",
        "id_token",
        "access_token",
        "refresh_token",
        "client_secret",
        "code",
      ].includes(name.toLowerCase())
    ) {
      url.searchParams.delete(name);
    }
  }
  url.hash = "";
  return url.toString();
}

function profileLabel(profile: ChatGPTProfile): string {
  return `${label(profile.id)}${profile.email ? ` (${label(profile.email)})` : ""}`;
}

function connection(profile: ChatGPTProfile): string {
  return `${profile.connected ? "connected" : "disconnected"}; ChatGPT plan usage: ${profile.sharing ? "enabled" : "disabled"}`;
}

function showActive(profiles: ChatGPTProfile[], output: Output): void {
  const active = profiles.find((profile) => profile.active);
  if (active) {
    output.log(
      `Active account: ${profileLabel(active)} — ${connection(active)}`,
    );
    if (active.connected && active.sharing) {
      output.log(
        "Using ChatGPT plan for eligible requests; subscription usage limits apply.",
      );
    }
  } else {
    output.log(
      "Active account: none. Run copilotkit:login to Continue with ChatGPT.",
    );
  }
  output.log(manageUsage);
}

const failures = {
  signIn:
    "ChatGPT sign-in failed. Retry login, or use --list and --account ID to reauthorize a saved account.",
  select:
    "Unable to switch ChatGPT accounts. Use --list and choose a saved account ID; reauthorize a disconnected account with --account ID.",
  list: "Unable to list saved ChatGPT accounts. Check access to your private SIWC store and retry.",
  logout:
    "ChatGPT sign-out failed. Retry, or disconnect the app in ChatGPT Settings.",
  models:
    "Unable to load the ChatGPT model catalog. Check your connection and reauthorize with --account ID if needed.",
};

export async function runChatGPTCli(
  args: string[],
  { auth: authDependency, output, signal }: Dependencies,
): Promise<number> {
  const command = parse(args);
  if (typeof command === "string") {
    output.error(command);
    return 2;
  }
  if (command.action === "help") {
    output.log(help);
    return 0;
  }
  try {
    signal?.throwIfAborted();
    // Delay loading the credential store (and native configuration) for help
    // and invalid arguments, including the removed device-auth workflow.
    const auth =
      typeof authDependency === "function"
        ? await authDependency()
        : authDependency;
    signal?.throwIfAborted();
    switch (command.action) {
      case "signIn":
        await auth.signIn({
          ...(command.profileId ? { profileId: command.profileId } : {}),
          ...(command.newProfile ? { newProfile: true } : {}),
          signal,
          onAuthorizationUrl: (url) => {
            signal?.throwIfAborted();
            output.log(`Continue with ChatGPT:\n${safeAuthorizationUrl(url)}`);
          },
        });
        signal?.throwIfAborted();
        output.log("Signed in with ChatGPT.");
        break;
      case "select":
        await auth.selectProfile(command.profileId);
        break;
      case "logout": {
        const { revoked } = await auth.signOut();
        signal?.throwIfAborted();
        output.log(
          revoked
            ? "Signed out; renewable session revoked. Account registration is retained for later sign-in."
            : "Signed out locally; remote revocation was not confirmed. Disconnect the app in ChatGPT Settings. Account registration is retained for later sign-in.",
        );
        break;
      }
      case "models": {
        const models = await auth.listModels();
        signal?.throwIfAborted();
        output.log(
          "Available models (server order; first is default unless CODEX_MODEL is set):",
        );
        for (const model of models) {
          output.log(`  ${label(model.slug)} — ${label(model.display_name)}`);
        }
        if (models.length === 0) {
          output.log("No visible models for the active account.");
        }
        output.log(
          "This is a catalog, not an inference test or a guarantee of model access.",
        );
        break;
      }
      case "list":
        break;
    }
    signal?.throwIfAborted();
    const profiles = await auth.listProfiles();
    signal?.throwIfAborted();
    if (command.action === "list") {
      if (profiles.length === 0) {
        output.log(
          "No saved ChatGPT accounts. Run copilotkit:login to sign in.",
        );
      }
      for (const profile of profiles) {
        output.log(
          `${profile.active ? "*" : "-"} ${profileLabel(profile)} — ${connection(profile)}`,
        );
      }
    }
    showActive(profiles, output);
    return 0;
  } catch (error) {
    if (signal?.aborted) {
      output.error("ChatGPT command canceled.");
      return 130;
    }
    // Only the auth boundary's deliberately sanitized errors are printable.
    // Arbitrary transport/JWT errors can contain tokens, URLs, or response bodies.
    output.error(
      error instanceof ChatGPTAuthError
        ? error.message
        : failures[command.action],
    );
    output.error(manageUsage);
    return 1;
  }
}
