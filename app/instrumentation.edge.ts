import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENV,
  release: `visualization-tool@${BUILD_VERSION}`,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
