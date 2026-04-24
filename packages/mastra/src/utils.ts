import type { Context, SystemMessage } from "@ag-ui/core";

export const convertContextToSystemMessage = (
  context: Context[],
  id: string,
): SystemMessage | null => {
  if (context.length === 0) return null;

  const contextContent =
    "## Runtime context (ephemeral, current turn only)\n\n" +
    context.map((i) => `### ${i.description}\n${i.value}`).join("\n\n");

  return {
    id,
    role: "system",
    content: contextContent,
  };
};
