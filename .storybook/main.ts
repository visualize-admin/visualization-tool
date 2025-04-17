import type { StorybookConfig } from "@storybook/nextjs";
import { dirname, join, resolve } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../app/**/*.docs.mdx", "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  // react-docgen-typescript is slow and we do not use docgen so we disable
  // docgen at the moment
  typescript: { reactDocgen: false },

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  docs: {},
  webpackFinal: async (config) => {
    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.extensions = [
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",

      // Added .dev.ts
      ".dev.ts",
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(__dirname, "../app"),
      "mapbox-gl": "maplibre-gl",
    };

    return config;
  },
};
export default config;
