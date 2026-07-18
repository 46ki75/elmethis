import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import "@elmethis/core/tokens.css";

afterEach(() => {
  cleanup();
});
