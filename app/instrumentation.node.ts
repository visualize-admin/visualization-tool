// import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import * as Sentry from "@sentry/nextjs";

import { BUILD_VERSION, SENTRY_DSN, SENTRY_ENV } from "./domain/env";

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "visualize",
  }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
});
sdk.start();

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENV,
  release: `visualization-tool@${BUILD_VERSION}`,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
