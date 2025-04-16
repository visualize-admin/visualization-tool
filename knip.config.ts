import { KnipConfig } from "knip";
import mdx from "knip/dist/compilers/mdx";

const config: KnipConfig = {
  paths: {
    "@/*": ["./app/*"],
  },
  entry: ["./app/pages/**/*.{ts,tsx,js,jsx}", "./app/test/colored-console.ts"],
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
    "./app/graphql/client.tsx",
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
  ignoreDependencies: [
    // Needed by eslint.
    "@typescript-eslint/utils",
    // Used in eslint, without explicit import.
    "eslint-plugin-storybook",
    "eslint-plugin-unused-imports",
    "@types/eslint",
    // Used in e2e tests.
    "@argos-ci/playwright",
    "pixelmatch",
    "@types/pixelmatch",
    "pngjs",
    "@types/pngjs",
    "@playwright/test",
    "playwright-testing-library",
    "@playwright-testing-library/test",
    // Codegen packages are used through scripts.
    "@graphql-codegen/*",
    "@lingui/cli",
    // Used in development.
    "prettier",
    "@urql/devtools",
    // Used in a script.
    "fs-extra",
    "@types/fs-extra",
    // Used in Storybook.
    "storybook",
    "@storybook/nextjs",
    // Used in e2e and scripts. Not sure why it's not detected.
    "isomorphic-unfetch",
    // Used in scripts, which we ignore to not have a "not used files" error.
    "dotenv-cli",
    // Used to generate icons.
    "@svgr/cli",
    // Used in load tests.
    "@types/k6",
    // Used in unit tests.
    "ts-jest",
    // Do we still need this?
    "babel-core",
    "@babel/standalone",
    "@babel/runtime",
    "core-js",
    "import-move-codemod",
  ],
  rules: {
    binaries: "warn",
    unresolved: "warn",
  },
  compilers: {
    mdx: mdx.compiler,
  },
};

export default config;
