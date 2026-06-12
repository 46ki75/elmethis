import { describe, expect, it } from "vitest";
import { tokenVars } from "./token-vars";

describe("tokenVars", () => {
  it("emits primitive leaves verbatim", () => {
    expect(tokenVars["--elmethis-primitive-color-blue-500"]).toBe("#68779f");
    expect(tokenVars["--elmethis-primitive-color-gold-200"]).toBe("#efecea");
  });

  it("references primitives from common semantic tokens", () => {
    expect(tokenVars["--elmethis-color-accent-link"]).toBe(
      "var(--elmethis-primitive-color-blue-500)",
    );
    expect(tokenVars["--elmethis-color-neutral-weak"]).toBe(
      "var(--elmethis-primitive-color-slate-300)",
    );
  });

  it("emits themed tokens as light-dark() over primitive references", () => {
    expect(tokenVars["--elmethis-color-surface-base"]).toBe(
      "light-dark(var(--elmethis-primitive-color-gold-200), var(--elmethis-primitive-color-slate-700))",
    );
  });

  it("prefixes the flat semantic key with --elmethis-", () => {
    expect(tokenVars["--elmethis-color-accent-link-visited"]).toBeDefined();
    expect(tokenVars["--elmethis-margin-block-start"]).toBe("2rem");
  });

  it("keeps non-primitive literals (computed oklch) verbatim", () => {
    expect(tokenVars["--elmethis-color-primary-hover"]).toBe(
      "oklch(from var(--elmethis-color-primary) l c h / 15%)",
    );
  });
});
