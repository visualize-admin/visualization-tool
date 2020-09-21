module.exports = {
  plugins: ["macros"],
  presets: [
    ["next/babel", { "preset-env": { useBuiltIns: "usage", corejs: 3 } }],
  ],
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
