type RuleSeverity = "off" | "warn" | "error";
type RuleConfig = RuleSeverity | [RuleSeverity, ...unknown[]];
type Rules = Record<string, RuleConfig>;

export const strictRules = {
  eqeqeq: ["error", "always", { null: "ignore" }],
  curly: ["error", "all"],
  "consistent-return": "error",
  "default-case-last": "error",
  "guard-for-in": "error",
  radix: "error",
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  // Keep third-party and test-double type boundaries visible while they migrate.
  "@typescript-eslint/no-base-to-string": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-return": "warn",
  "@typescript-eslint/require-await": "warn",
  "@typescript-eslint/unbound-method": "warn",
} satisfies Rules;

export const typedTestRules = {
  "@typescript-eslint/await-thenable": "warn",
} satisfies Rules;
