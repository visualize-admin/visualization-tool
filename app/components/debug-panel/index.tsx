import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { flag } from "@/flags";

import { DebugPanelProps } from "./DebugPanel";

const LazyDebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

const DebugPanel = (props: DebugPanelProps) => {
  const shouldShow = flag("debug") || process.env.NODE_ENV === "development";

  if (!shouldShow) {
    return null;
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <LazyDebugPanel {...props} />
    </Suspense>
  );
};

export default DebugPanel;
