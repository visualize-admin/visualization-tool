const { locales } = require("./app/locales/locales.json");

module.exports = {
  locales,
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}/messages",
      include: ["<rootDir>/app"],
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
};
