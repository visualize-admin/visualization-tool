const { IgnorePlugin } = require("webpack");
const pkg = require("../package.json");
const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withPreconstruct = require("@preconstruct/next");

const { locales, defaultLocale } = require("./locales/locales.json");

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

      ...(process.env.NETLIFY === "true" ? { target: "serverless" } : {}),

      // Build-time env variables
      env: {
        VERSION,
      },

      i18n: {
        locales,
        defaultLocale,
      },

      headers: async () => {
        let headers = [];

        if (process.env.ALLOW_SEARCH_BOTS !== "true") {
          headers.push({
            source: "/:path*",
            headers: [
              {
                key: "X-Robots-Tag",
                value: "noindex, nofollow",
              },
            ],
          });
        }

        return headers;
      },

      pageExtensions: ["js", "ts", "tsx", "mdx"],

      eslint: {
        // Warning: Dangerously allow production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },

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

        // For some reason these need to be ignored for serverless target
        config.plugins.push(new IgnorePlugin(/^(pg-native|vue)$/));

        return config;
      },
    })
  )
);
