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
    "\\.(css)$": "<rootDir>/test/style-mock.js",
    "^@/(.*)$": "<rootDir>/$1",
    "^d3-(.+)$": "<rootDir>/../node_modules/d3-$1/dist/d3-$1.js",
  },
  transform: {
    "node_modules/@rdf*": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/!@rdf*"],
};

module.exports = config;
