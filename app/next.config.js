const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const publicRuntimeConfig = {
  // SPARQL_ENDPOINT: "https://ld.stadt-zuerich.ch/query"
  SPARQL_ENDPOINT:
    process.env.SPARQL_ENDPOINT ||
    "https://trifid-lindas.test.cluster.ldbar.ch/query",
  PUBLIC_URL: process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL.replace(/\/$/, "")
    : "",
  GA_TRACKING_ID: process.env.GA_TRACKING_ID
};

console.log("Starting with publicRuntimeConfig\n", publicRuntimeConfig);

module.exports = withBundleAnalyzer(
  withMDX({
    publicRuntimeConfig,

    pageExtensions: ["js", "tsx", "mdx"],

    webpack(config, { dev, isServer, defaultLoaders }) {
      // Transpile ES6 modules from node_modules
      // ATTENTION: this does actually NOT WORK. Probably needs a different loader than the next-babel-loader (like e.g. vanilla babel-loader). Figure out later. Cf. https://github.com/facebook/create-react-app/blob/f36d61a5dbabd0266c65bcdb3061d8bf9334f752/packages/react-scripts/config/webpack.config.js#L444-L482
      // config.module.rules.push({
      //   test: /\.(js|mjs)$/,
      //   loader: defaultLoaders.babel,
      //   include: [
      //     /node_modules/
      //   ]
      // });

      // config.module.rules.push({
      //   test: /\.(js|mjs)$/,
      //   include: [/node_modules/],
      //   exclude: [/babel\/standalone/, /core-js/, /next/],
      //   use: {
      //     loader: "babel-loader"
      //   }
      // });
      config.module.rules.push({
        test: /\.(js|mjs)$/,
        include: [/node_modules/],
        exclude: [/@babel\/standalone/, /@babel\/runtime/, /core-js/, /next/],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
            // plugins: ["@babel/plugin-syntax-dynamic-import"]
          }
        }
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
    }
  })
);
