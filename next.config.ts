/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.ts";

/** @type {import("next").NextConfig} */
const config = {
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default config;
