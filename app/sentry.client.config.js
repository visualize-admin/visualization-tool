// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENV,
  release: `visualization-tool@${BUILD_VERSION}`,
  tracesSampleRate: 1.0,
  tracesSampler: (samplingContext) => {
    // Ignore auth calls to prevent 405 Keycloak errors.
    if (samplingContext.transactionContext?.name?.includes("auth")) {
      return 0;
    }
  },
  ignoreErrors: [
    // The ResizeObserver error is actually not problematic
    // @see https://forum.sentry.io/t/resizeobserver-loop-limit-exceeded/8402
    "ResizeObserver loop",
  ],
});
