// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    release: `visualization-tool@${BUILD_VERSION}`,
    tracesSampleRate: 0.1,
    instrumenter: {
      patch: (mod, path, logger) => {
        // Ignore auth calls to prevent 405 authentication errors.
        if (path?.includes("auth")) {
          return null;
        }

        return mod;
      },
    },
  });
}
