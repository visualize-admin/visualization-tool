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
              `default-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelDefault}`,
              `script-src 'self' 'unsafe-inline'${unsafeEval}${sentryCSP}${vercelScript} https://api.mapbox.com https://api.maptiler.com`,
              `script-src-elem 'self' 'unsafe-inline' https://*.admin.ch https://visualize.admin.ch https://*.visualize.admin.ch${vercelScriptElem} https://api.mapbox.com`,
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

          // When CSP_REPORT_ONLY=true, emit the report-only header so violations
          // are surfaced to the browser console without being enforced. Useful
          // for rolling out tighter policies. The header is otherwise always
          // present — there is intentionally no kill-switch to fully disable CSP.
          const reportOnly =
            process.env.CSP_REPORT_ONLY &&
            process.env.CSP_REPORT_ONLY === "true";
          const cspKey = reportOnly
            ? "Content-Security-Policy-Report-Only"
            : "Content-Security-Policy";

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
          headers.push({
            source: "/:path*",
            headers: [
              ...baseHeaders,
              { key: cspKey, value: buildCSP("'self'") },
            ],
          });

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
            headers.push({
              source,
              headers: [...baseHeaders, { key: cspKey, value: buildCSP("*") }],
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
    ),
    { silent: true },
    { hideSourcemaps: true }
  )
);