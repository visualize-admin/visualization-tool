const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

module.exports = withBundleAnalyzer(
  withMDX({
    env: {
      SPARQL_ENDPOINT: "https://trifid-lindas.test.cluster.ldbar.ch/query"
      // SPARQL_ENDPOINT: "https://ld.stadt-zuerich.ch/query"
    },

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
