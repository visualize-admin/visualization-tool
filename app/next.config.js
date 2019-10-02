const withMDX = require("@next/mdx")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

module.exports = withBundleAnalyzer(
  withMDX({
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

      return config;
    }
  })
);
