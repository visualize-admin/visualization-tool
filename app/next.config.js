const pkg = require("../package.json");
const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withPreconstruct = require("@preconstruct/next");

const VERSION = `v${pkg.version}`;

const publicRuntimeConfig = {
  PUBLIC_URL: process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL.replace(/\/$/, "")
    : "",
  GA_TRACKING_ID: process.env.GA_TRACKING_ID,
};

console.log("Starting with publicRuntimeConfig\n", publicRuntimeConfig);
console.log("Version", VERSION);
console.log("Extra Certs", process.env.NODE_EXTRA_CA_CERTS);

module.exports = withPreconstruct(
  withBundleAnalyzer(
    withMDX({
      publicRuntimeConfig,

      // Build-time env variables
      env: {
        VERSION,
      },

      pageExtensions: ["js", "ts", "tsx", "mdx"],

      webpack(config, { dev, isServer, defaultLoaders }) {
        config.module.rules.push({
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: "graphql-tag/loader",
        });

        /* Enable source maps in production */
        if (!dev) {
          config.devtool = "source-map";

          for (const plugin of config.plugins) {
            if (plugin.constructor.name === "UglifyJsPlugin") {
              plugin.options.sourceMap = true;
              break;
            }
          }

          if (config.optimization && config.optimization.minimizer) {
            for (const plugin of config.optimization.minimizer) {
              if (plugin.constructor.name === "TerserPlugin") {
                plugin.options.sourceMap = true;
                break;
              }
            }
          }
        }

        return config;
      },
    })
  )
);
