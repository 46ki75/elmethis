import { format } from "oxfmt";

export async function formatGenerated(
  fileName: string,
  sourceText: string,
): Promise<string> {
  // The Node API does not resolve .oxfmtrc.json and returns diagnostics instead
  // of rejecting, so keep these options aligned and fail before writing output.
  const { code, errors } = await format(fileName, sourceText, {
    printWidth: 80,
    sortPackageJson: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map(
        ({ severity, message, codeframe }) =>
          `${severity}: ${message}${codeframe ? `\n${codeframe}` : ""}`,
      )
      .join("\n");
    throw new Error(`Could not format ${fileName}:\n${details}`);
  }

  return code;
}
