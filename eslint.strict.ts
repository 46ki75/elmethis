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
  "@typescript-eslint/ban-ts-comment": [
    "error",
    { minimumDescriptionLength: 10 },
  ],
  "@typescript-eslint/no-meaningless-void-operator": "error",
  "@typescript-eslint/no-misused-spread": "error",
  "@typescript-eslint/no-mixed-enums": "error",
  "@typescript-eslint/no-useless-default-assignment": "error",
  "@typescript-eslint/related-getter-setter-pairs": "error",
  "@typescript-eslint/return-await": [
    "error",
    "error-handling-correctness-only",
  ],
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
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

export const strictLinterOptions = {
  reportUnusedDisableDirectives: "error",
  reportUnusedInlineConfigs: "error",
} as const;

export const typedTestRules = {
  "@typescript-eslint/await-thenable": "warn",
} satisfies Rules;
