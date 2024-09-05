import { useEffect, useRef, useState } from "react";

import {
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";

type PreviewBreakpoint = "lg" | "md" | "sm";

export const usePreviewBreakpoint = () => {
  const [state] = useConfiguratorState(isLayouting);
  const [breakpoint, setBreakpoint] = useState<PreviewBreakpoint | null>(null);
  const layoutRef = useRef(state.layout);
  useEffect(() => {
    if (!breakpoint) {
      layoutRef.current = state.layout;
    }
  }, [breakpoint, state.layout]);

  return {
    previewBreakpoint: breakpoint,
    setPreviewBreakpoint: setBreakpoint,
    previewBreakpointLayout: layoutRef.current,
  };
};
