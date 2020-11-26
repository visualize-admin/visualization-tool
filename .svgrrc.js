module.exports = {
  indexTemplate: require("./scripts/svgr/index-template"),
  icon: true,
  typescript: true,
  replaceAttrValues: {
    "#454545": "currentColor",
    "#000": "currentColor",
    "#000000": "currentColor",
  },
  filenameCase: "pascal",
};
