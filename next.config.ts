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
  // @ts-expect-error-file nextjs config
  webpack: (config, options) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    config.module.rules.push({
      test: /\.node/,
      use: "node-loader",
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
};

export default config;
