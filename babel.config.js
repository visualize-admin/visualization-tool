module.exports = {
  presets: ["next/babel"],
  plugins: ["macros"],
  env: {
    NPM_PACKAGE: {
      plugins: [
        [
          "module-resolver",
          {
            alias: {
              "^@/(.+)": "./app/\\1",
            },
          },
        ],
      ],
      presets: [
        [
          "next/babel",
          {
            "transform-runtime": {
              useESModules: false,
            },
          },
        ],
      ],
    },
  },
};
