import { formatter } from "@lingui/format-po";

const { locales } = require("./app/locales/locales.json");

module.exports = {
  locales,
  catalogs: [
    {
      path: "app/locales/{locale}/messages",
      include: ["app"],
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/.storybook/**",
        "**/*.stories.{js,jsx,ts,tsx}",
        "**/public/**",
      ],
    },
  ],
  format: "po",
  compileNamespace: "ts",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
  format: formatter({ explicitIdAsDefault: true }),
};
