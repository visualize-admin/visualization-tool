module.exports = {
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
};
