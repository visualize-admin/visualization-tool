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

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.log("Sentry DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN);
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
          // See https://content-security-policy.com/ & https://developers.google.com/tag-platform/security/guides/csp
          const isDev = process.env.NODE_ENV === "development";
          const isVercel = !!process.env.VERCEL;
          const sentryCSP = process.env.NEXT_PUBLIC_SENTRY_CSP
            ? ` ${process.env.NEXT_PUBLIC_SENTRY_CSP}`
            : "";
          const unsafeEval = isDev ? " 'unsafe-eval'" : "";
          // Vercel Toolbar / Live Comments hosts — only needed on Vercel deployments
          const vercelDefault = isVercel
            ? " https://vercel.live/ https://vercel.com"
            : "";
          const vercelScript = isVercel
            ? " https://vercel.live/ https://vercel.com"
            : "";
          const vercelScriptElem = isVercel
            ? " https://vercel.live https://vercel.com https://*.vercel.app"
            : "";
          const vercelWorker = isVercel ? " https://*.vercel.app" : "";

          const buildCSP = (frameAncestors) =>
            [
              `default-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelDefault} https://*.googletagmanager.com`,
              `script-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelScript} https://*.googletagmanager.com https://api.mapbox.com https://api.maptiler.com`,
              `script-src-elem 'self' 'unsafe-inline' https://*.admin.ch https://visualize.admin.ch https://*.visualize.admin.ch${vercelScriptElem} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.mapbox.com`,
              `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
              `font-src 'self'`,

              // * to allow loading legend images from custom WMS / WMTS endpoints and data: to allow downloading images
              `img-src 'self' * data: blob:`,

              // * to allow WMS / WMTS endpoints
              `connect-src 'self' *`,

              `worker-src 'self' blob: https://*.admin.ch${vercelWorker}`,
              `form-action 'self'`,
              `frame-ancestors ${frameAncestors}`,
              `object-src 'none'`,
              `base-uri 'self'`,
              `upgrade-insecure-requests`,
            ].join("; ");

          const cspDisabled =
            process.env.DISABLE_CSP && process.env.DISABLE_CSP === "true";

          const baseHeaders = [
            { key: "X-Content-Type-Options", value: "nosniff" },
          ];
          if (process.env.PREVENT_SEARCH_BOTS === "true") {
            baseHeaders.push({
              key: "X-Robots-Tag",
              value: "noindex, nofollow",
            });
          }

          const headers = [];

          // Catch-all — block iframing to prevent clickjacking on the editor / browser / login UI.
          // Must come first: when multiple Next.js header rules match the same path,
          // later rules override earlier ones for the same header key.
          const defaultHeaders = [...baseHeaders];
          if (!cspDisabled) {
            defaultHeaders.push({
              key: "Content-Security-Policy",
              value: buildCSP("'self'"),
            });
          }
          headers.push({ source: "/:path*", headers: defaultHeaders });

          // Routes that are intended to be embedded in third-party iframes.
          // These override the catch-all CSP to allow `frame-ancestors *`.
          // `/api/embed-aem-ext/*` serves the AEM external-embed HTML wrapper,
          // which partner sites may iframe directly.
          const embeddableSources = [
            "/embed/:path*",
            "/preview",
            "/api/embed-aem-ext/:path*",
          ];
          for (const source of embeddableSources) {
            const h = [...baseHeaders];
            if (!cspDisabled) {
              h.push({
                key: "Content-Security-Policy",
                value: buildCSP("*"),
              });
            }
            headers.push({ source, headers: h });
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
    ),
    { silent: true },
    { hideSourcemaps: true }
  )
);
