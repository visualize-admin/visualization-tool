const { locales } = require("./app/locales/locales.json");

module.exports = {
  locales,
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}/messages",
      include: ["<rootDir>/app"],
      exclude: ["**/node_modules/**", "**/.next/**"],
    },
  ],
  format: "po",
  compileNamespace: "cjs",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
};
