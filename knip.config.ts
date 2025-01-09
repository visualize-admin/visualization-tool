import { KnipConfig } from "knip";

const config: KnipConfig = {
  paths: {
    "@/*": ["./app/*"],
  },
  ignore: [
    ".github/**/*",
    ".svgrrc.js",
    ".storybook/**/*",
    "./codemods/**/*",
    "./e2e/**/*",
    "./embed/**/*",
    "./eslint/**/*",
    "./k6/**/*",
    "./scripts/**/*",
    "./app/docs/**/*",
    "./app/graphql/devtools.*",
    "./app/graphql/resolvers/**/*",
    "./app/graphql/query-hooks.ts",
    "./app/graphql/resolver-types.ts",
    "./app/pages/docs/**/*",
    "./app/public/**/*",
    "./app/static-pages/**/*",
    "./app/templates/email/**/*",
    "./app/typings/**/*",
    "./**/*.config.*",
    "./**/*.mock.ts",
    "./**/*.setup.*",
    "./**/*.spec.ts",
  ],
  ignoreDependencies: ["pixelmatch", "pngjs"],
};

export default config;
