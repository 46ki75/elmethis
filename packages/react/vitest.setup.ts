// Unit-layer setup (vite.config.ts `test.setupFiles`).
//
// - Registers jest-dom matchers (`toBeInTheDocument`, `toHaveClass`, …) on
//   Vitest's `expect`.
// - Auto-unmounts React Testing Library trees after every test so DOM state
//   does not leak between specs.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
