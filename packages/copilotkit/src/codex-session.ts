import { join } from "node:path";
import { ChatGPTAuth } from "./chatgpt-auth.ts";
import {
  CODEX_CONFIG,
  codexHome,
  codexProcessOptions,
} from "./codex-config.ts";
import { spawnCodexConnection, type CodexConnection } from "./codex-rpc.ts";
import { createCodexModelCatalog } from "./codex-model-catalog.ts";

const accounts = new Map<string, ChatGPTAuth>();

export function chatgptAuth(): ChatGPTAuth {
  const directory = join(codexHome(), "siwc");
  let auth = accounts.get(directory);
  if (!auth) {
    auth = new ChatGPTAuth({ directory });
    accounts.set(directory, auth);
  }
  return auth;
}

export function selectChatGPTModel(
  models: Array<{ slug: string; display_name: string }>,
  requested?: string,
): string {
  if (!models.length) {
    throw new Error(
      "No models are available for this ChatGPT plan connection.",
    );
  }
  if (requested && !models.some((model) => model.slug === requested)) {
    throw new Error(
      "CODEX_MODEL is not in this account's model catalog. Run `mise exec -- pnpm --filter backend run codex:login --models` to list models.",
    );
  }
  return requested || models[0].slug;
}

export async function createCodexSession(options: {
  model?: string;
  signal: AbortSignal;
  auth?: Pick<ChatGPTAuth, "getInferenceSession">;
  connect?: typeof spawnCodexConnection;
}): Promise<{ connection: CodexConnection; model: string }> {
  options.signal.throwIfAborted();
  const auth = options.auth ?? chatgptAuth();
  // Codex model/list can be a bundled catalog, not an entitlement check.
  // Select from the account-specific SIWC catalog instead:
  // https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
  const { models, accessToken } = await auth.getInferenceSession();
  options.signal.throwIfAborted();
  const model = selectChatGPTModel(models, options.model);
  const process = codexProcessOptions(accessToken);
  const catalog = createCodexModelCatalog(
    models.find((entry) => entry.slug === model)!,
  );
  try {
    const connection = (options.connect ?? spawnCodexConnection)({
      ...process,
      args: [
        ...process.args,
        "app-server",
        "--listen",
        "stdio://",
        "--strict-config",
        ...[
          ...CODEX_CONFIG,
          `model_catalog_json=${JSON.stringify(catalog.path)}`,
        ].flatMap((value) => ["-c", value]),
      ],
    });
    return {
      model,
      connection: {
        events: connection.events,
        request: (method, params) => connection.request(method, params),
        notify: (method, params) => connection.notify(method, params),
        respond: (id, result) => connection.respond(id, result),
        close() {
          try {
            connection.close();
          } finally {
            catalog.close();
          }
        },
      },
    };
  } catch (error) {
    catalog.close();
    throw error;
  }
}
