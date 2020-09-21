import * as React from "react";
import { Box } from "theme-ui";
import { useInteraction } from "../use-interaction";
import { useChartState } from "../use-chart-state";
import { LinesState } from "../lines/lines-state";
import { Observation } from "../../../domain/data";

export const HoverDot = () => {
  const [state] = useInteraction();

  const { visible, d } = state.interaction;

  return <>{visible && d && <DotInner d={d} />}</>;
};

const DotInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;

  const { xAnchor, yAnchor, datum } = getAnnotationInfo(d);

  return (
    <Box
      style={{
        left: xAnchor + bounds.margins.left,
        top: yAnchor + bounds.margins.top,
        backgroundColor: datum.color,
      }}
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        position: "absolute",
        transform: "translate3d(-50%, -50%, 0)",
        pointerEvents: "none",
      }}
    />
  );
};
