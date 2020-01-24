import React from "react";
import { Box } from "theme-ui";
import { useChartState } from "./chart-state";

export const Tooltip = () => {
  // @ts-ignore
  const [state, dispatch] = useChartState();
  const { visible, x, y, content } = state.tooltip;
  const { width, height } = state.bounds;

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        top: 0
      }}
    >
      {visible && (
        <Box
          style={{
            width: "fit-content",
            pointerEvents: "none",
            backgroundColor: "white",
            border: "1px solid black",
            padding: 2,
            transform: `translate3d(${width / 2 + x}px,${height / 2 + y}px,0)`
          }}
        >
          {content}
        </Box>
      )}
    </Box>
  );
};
