import type { KnipConfig } from "knip";

/** Hugo workspace — all deps and files are consumed by Hugo Go templates, not TypeScript. */
const config: KnipConfig = {
  ignore: ["**"],
};

export default config;
