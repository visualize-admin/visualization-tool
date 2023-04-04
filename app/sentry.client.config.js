// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { SENTRY_DSN } from "./domain/env";

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  ignoreErrors: [
    // The ResizeObserver error is actually not problematic
    // @see https://forum.sentry.io/t/resizeobserver-loop-limit-exceeded/8402
    "ResizeObserver loop",
  ],
});
