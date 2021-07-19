module.exports = {
  presets: ["next/babel"],
  plugins: ["macros"],
  env: {
    NPM_PACKAGE: {
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
