import "dotenv/config";
import { spawn } from "node:child_process";
import { codexProcessOptions } from "./codex-config.ts";

const options = codexProcessOptions();
const child = spawn(
  options.command,
  [
    ...options.args,
    "-c",
    'forced_login_method="chatgpt"',
    "-c",
    'cli_auth_credentials_store="file"',
    "login",
    ...process.argv.slice(2),
  ],
  { cwd: options.cwd, env: options.env, stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
