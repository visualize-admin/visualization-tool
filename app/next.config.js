// This file sets a custom webpack configuration to use your Next.js app with Sentry.
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

const { defaultLocale, locales } = require("./locales/locales.json");

// Populate build-time variables from package.json
process.env.NEXT_PUBLIC_VERSION = `v${pkg.version}`;
process.env.NEXT_PUBLIC_GITHUB_REPO = pkg.repository.url.replace(
  /(\/|\.git)$/,
  ""
);
// Dynamic NEXTAUTH_URL logic
const isVercelPreview = !!process.env.VERCEL_URL;

// Dynamically set NEXTAUTH_URL
if (isVercelPreview) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("Version", process.env.NEXT_PUBLIC_VERSION);
console.log("Commit", process.env.NEXT_PUBLIC_COMMIT);
console.log("GitHub Repo", process.env.NEXT_PUBLIC_GITHUB_REPO);

console.log("Extra Certs", process.env.NODE_EXTRA_CA_CERTS);
console.log("Prevent search bots", process.env.PREVENT_SEARCH_BOTS);

if (process.env.SENTRY_DSN) {
  console.log("Sentry DSN:", process.env.SENTRY_DSN);
}

module.exports = withSentryConfig(
  withPreconstruct(
    withBundleAnalyzer(
      withMDX({
        output: "standalone",
        i18n: {
          locales,
          defaultLocale,
        },

        experimental: {
          instrumentationHook: true,
        },

        headers: async () => {
          // Static security headers that don't depend on runtime env vars.
          // Dynamic headers (CSP, X-Robots-Tag) are set in middleware.ts so they
          // can read runtime env vars injected into the container at startup.
          const baseHeaders = [
            { key: "X-Content-Type-Options", value: "nosniff" },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
            {
              key: "Permissions-Policy",
              value:
                "bluetooth=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()",
            },
            // COOP isolates this browsing context from cross-origin openers.
            // Safe here: no popup-based auth (NextAuth ADFS uses redirect flow),
            // and on iframed embed pages COOP is a no-op (only affects top-level
            // windows). NOT setting `Cross-Origin-Embedder-Policy: require-corp`
            // because it would block user-configured WMS/WMTS tile endpoints
            // (most don't send CORP/CORS headers). NOT setting
            // `Cross-Origin-Resource-Policy: same-origin` or `X-Frame-Options`
            // because they would break iframe embedding of charts; CSP
            // `frame-ancestors` already handles clickjacking protection.
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ];

          return [{ source: "/:path*", headers: baseHeaders }];
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
    ),
    { silent: true },
    { hideSourcemaps: true }
  )
);
