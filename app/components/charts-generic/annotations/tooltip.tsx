import React from "react";
import { Box } from "theme-ui";
import { useInteraction } from "../use-interaction";
import { useBounds } from "../use-bounds";

export const Tooltip = React.memo(() => {
  const [state] = useInteraction();
  const { visible, x, y, placement, content } = state.tooltip;
  const { margins } = useBounds();

  return (
    <>
      {visible && (
        <Box
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "fit-content",
            pointerEvents: "none",
            backgroundColor: "white",
            border: "1px solid black",
            padding: 2,
            transform: `translate3d(${x! + margins.left}px,${y! +
              margins.top}px,0)`
          }}
        >
          <Box
            sx={
              {
                // transform:
                //   placement === "left"
                //     ? "translate3d(-100%, 0, 0)"
                //     : "translate3d(0, 0, 0)"
              }
            }
          >
            {content}
          </Box>
        </Box>
      )}
    </>
  );
});
