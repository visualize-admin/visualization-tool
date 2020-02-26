module.exports = {
  plugins: ["macros"],
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          useBuiltIns: "usage",
          corejs: 2 // Next.js comes with v2
        }
      }
    ]
  ]
};
