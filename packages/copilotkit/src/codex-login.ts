import "dotenv/config";
import { runChatGPTCli } from "./chatgpt-cli.ts";

const controller = new AbortController();
const interrupt = () => controller.abort();
process.on("SIGINT", interrupt);
try {
  process.exitCode = await runChatGPTCli(process.argv.slice(2), {
    auth: async () => {
      const { chatgptAuth } = await import("./codex-session.ts");
      return chatgptAuth();
    },
    output: {
      log: (message) => console.log(message),
      error: (message) => console.error(message),
    },
    signal: controller.signal,
  });
} finally {
  process.off("SIGINT", interrupt);
}
