import React, { ReactNode } from "react";
import { Box } from "theme-ui";
import { useInteraction } from "../use-interaction";
import { useBounds } from "../use-bounds";

export interface RulerProps {
  y: number;
  body: string | ReactNode;
  color: string;
}

export const Ruler = React.memo(() => {
  const [state] = useInteraction();
  const { visible, x, placement, points } = state.ruler;
  const { margins, chartHeight } = useBounds();

  return (
    <>
      {visible && points && (
        <>
          {points
            .filter(p => p.body !== "x")
            .filter(p => p.body !== "total")
            .map((point, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "fit-content",
                  pointerEvents: "none",
                  color: point.color,
                  backgroundColor: "white",
                  border: `2px solid ${point.color}`,
                  padding: 2,
                  transform: `translate3d(${x! + margins.left}px,${point.y! +
                    margins.top}px,0)`
                }}
              >
                {point.body}
              </Box>
            ))}
        </>
      )}
    </>
  );
});
