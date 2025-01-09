import { KnipConfig } from "knip";

const config: KnipConfig = {
  paths: {
    "@/*": ["./app/*"],
  },
  ignore: [
    "./app/docs/**/*",
    "./app/graphql/devtools.*",
    "./app/graphql/resolvers/**/*",
    "./app/graphql/query-hooks.ts",
    "./app/graphql/resolver-types.ts",
    "./app/pages/docs/**/*",
    "./app/static-pages/**/*",
    "./app/typings/**/*",
    "./codemods/**/*",
    "./e2e/**/*",
    "./eslint/**/*",
    "./k6/**/*",
    "./scripts/**/*",
    "./**/*.config.*",
    "./**/*.mock.ts",
    "./**/*.setup.*",
    "./**/*.spec.ts",
    ".svgrrc.js",
  ],
};

export default config;
