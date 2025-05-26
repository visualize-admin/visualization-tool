import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { useFlag } from "@/flags";

import { DebugPanelProps } from "./debug-panel";

const LazyDebugPanel = dynamic(() => import("./debug-panel"), { ssr: false });

const DebugPanel = (props: DebugPanelProps) => {
  const flagActive = useFlag("debug");
  const show = flagActive ?? process.env.NODE_ENV === "development";

  if (!show) {
    return null;
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <LazyDebugPanel {...props} />
    </Suspense>
  );
};

export default DebugPanel;
