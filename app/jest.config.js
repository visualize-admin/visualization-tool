/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    "ts-jest": {
      isolatedModules: true,
      tsconfig: "tsconfig.test.json",
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css)$": "<rootDir>/test/style-mock.js",
  },
  transform: {
    "node_modules/@rdf*": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/!@rdf*"],
};

module.exports = config;
