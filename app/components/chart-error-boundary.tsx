import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ChartUnexpectedError } from "@/components/hint";

export const ChartErrorBoundary = ({
  children,
  resetKeys,
}: {
  children: ReactNode;
  resetKeys?: unknown[];
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={ChartUnexpectedError}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};
