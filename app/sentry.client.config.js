// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    release: `visualization-tool@${BUILD_VERSION}`,
    tracesSampleRate: 0.1,
    ignoreErrors: [
      // The ResizeObserver error is actually not problematic
      // @see https://forum.sentry.io/t/resizeobserver-loop-limit-exceeded/8402
      "ResizeObserver loop",
      // Coming apparently from Outlook
      // @see https://www.notion.so/interactivethings/Common-Sentry-Ignore-Rules-f0b1e94a6ac34ffd8d39b53498c48a45?pvs=4
      "Non-Error promise rejection captured",
    ],
  });
}
