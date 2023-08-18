// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN } from "./domain/env";
import { getSentryEnv } from "./sentry-utils";

Sentry.init({
  dsn: SENTRY_DSN,
  release: `visualization-tool@${BUILD_VERSION}`,
  tracesSampleRate: 1.0,
  environment: getSentryEnv(),
});
