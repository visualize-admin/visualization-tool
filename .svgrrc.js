module.exports = {
  indexTemplate: require("./scripts/svgr/index-template"),
  icon: true,
  typescript: true,
  replaceAttrValues: {
    "#1F2937": "currentColor",
  },
  filenameCase: "pascal",
};
