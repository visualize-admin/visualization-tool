// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();
const withPreconstruct = require("@preconstruct/next");
const { withSentryConfig } = require("@sentry/nextjs");
const { IgnorePlugin } = require("webpack");

const pkg = require("../package.json");

const { locales, defaultLocale } = require("./locales/locales.json");

// Populate build-time variables from package.json
process.env.NEXT_PUBLIC_VERSION = `v${pkg.version}`;
process.env.NEXT_PUBLIC_GITHUB_REPO = pkg.repository.url.replace(
  /(\/|\.git)$/,
  ""
);

console.log("Version", process.env.NEXT_PUBLIC_VERSION);
console.log("Commit", process.env.NEXT_PUBLIC_COMMIT);
console.log("GitHub Repo", process.env.NEXT_PUBLIC_GITHUB_REPO);

console.log("Extra Certs", process.env.NODE_EXTRA_CA_CERTS);
console.log("Prevent search bots", process.env.PREVENT_SEARCH_BOTS);

module.exports = withPreconstruct(
  withBundleAnalyzer(
    withMDX({
      output: "standalone",
      i18n: {
        locales,
        defaultLocale,
      },

      // See https://content-security-policy.com/ & https://developers.google.com/tag-platform/security/guides/csp
      headers: async () => {
        const headers = [];

        headers.push({
          source: "/:path*",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Content-Security-Policy",
              value: [
                `default-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " unsafe-eval" : ""}`,
                `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " localhost:*" : ""} https://*.sentry.io https://vercel.live/ https://vercel.com https://*.googletagmanager.com`,
                `style-src 'self' 'unsafe-inline'`,
                `font-src 'self'`,
                `form-action 'self'`,
                `connect-src 'self'${process.env.NODE_ENV === "development" ? " localhost:*" : ""} https//*.sentry.io https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
                `img-src 'self' https://vercel.live https://vercel.com *.pusher.com *.pusherapp.com https://*.admin.ch https://*.opendataswiss.org https://*.google-analytics.com https://*.googletagmanager.com${process.env.NODE_ENV === "development" ? " localhost:*" : ""} data: blob:`,
                `script-src-elem 'self' 'unsafe-inline' https://*.admin.ch https://vercel.live https://vercel.com`,
                `worker-src 'self' blob: https://*.admin.ch`,
              ].join("; "),
            },
          ],
        });

        if (process.env.PREVENT_SEARCH_BOTS === "true") {
          headers[0].headers.push({
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
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

      webpack(config, { dev }) {
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

        config.resolve.extensions.push(dev ? ".dev.ts" : ".prod.ts");
        config.resolve.alias = {
          ...config.resolve.alias,
          "mapbox-gl": "maplibre-gl",
        };
        // For some reason these need to be ignored for serverless target
        config.plugins.push(
          new IgnorePlugin({ resourceRegExp: /^(pg-native|vue)$/ })
        );

        return config;
      },

      async redirects() {
        return [
          {
            source: "/storybook",
            destination: "/storybook/index.html",
            permanent: true,
          },
        ];
      },
    })
  )
);

module.exports = withSentryConfig(
  module.exports,
  { silent: true },
  { hideSourcemaps: true }
);
