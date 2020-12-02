module.exports = {
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}/messages",
      include: ["<rootDir>/app"],
      exclude: ["**/node_modules/**", "**/.next/**"],
    },
  ],
  locales: ["de", "fr", "it", "en"],
  format: "po",
  compileNamespace: "cjs",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
};
