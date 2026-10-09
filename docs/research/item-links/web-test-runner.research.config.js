// Throwaway config for the #179 research harness (docs/research/item-links.md). It reuses the library's
// config and adds the a11y-snapshot command, which @web/test-runner does not register by default.
import { a11ySnapshotPlugin } from "@web/test-runner-commands/plugins";
import base from "./web-test-runner.config.js";

export default {
  ...base,
  files: ["src/research/item-links.test.ts"],
  groups: [],
  plugins: [...base.plugins, a11ySnapshotPlugin()],
};
