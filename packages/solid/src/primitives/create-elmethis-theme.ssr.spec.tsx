import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import {
  createElmethisTheme,
  THEME_CHANGE_EVENT,
} from "./create-elmethis-theme";

const ThemeState = () => {
  const theme = createElmethisTheme();
  return <output>{String(theme.isDarkTheme())}</output>;
};

describe("[SSR] createElmethisTheme", () => {
  it("renders deterministic light state without browser globals", () => {
    expect(renderToString(() => <ThemeState />)).toContain(">false</output>");
    expect(THEME_CHANGE_EVENT).toBe("elmethis-theme-change");
  });
});
