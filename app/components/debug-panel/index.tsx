import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LazyDebugPanel = dynamic(() => import("./DebugPanel"));

export default process.env.NODE_ENV === "development"
  ? (props: React.ComponentProps<typeof LazyDebugPanel>) => (
      <Suspense fallback={<CircularProgress />}>
        <LazyDebugPanel {...props} />
      </Suspense>
    )
  : () => null;
