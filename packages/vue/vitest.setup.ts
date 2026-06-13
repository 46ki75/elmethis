// Unit-layer setup (vite.config.ts `test.setupFiles`).
//
// Auto-unmounts Vue Test Utils wrappers after every test so DOM state and
// component instances do not leak between specs.
import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

enableAutoUnmount(afterEach);
