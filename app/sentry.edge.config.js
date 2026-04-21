// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever middleware or an Edge route handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    release: `visualization-tool@${BUILD_VERSION}`,
    tracesSampleRate: 0.1,
  });
}
