import * as React from "react";
import { Box } from "theme-ui";
import { useInteraction } from "../use-interaction";
import { useBounds } from "../use-bounds";
import { useChartState } from "../use-chart-state";
import { LinesState } from "../lines/lines-state";
import { Observation } from "../../../domain/data";

export const HoverDot = () => {
  const [state] = useInteraction();

  const { visible, d } = state.annotation;

  return <>{visible && d && <DotInner d={d} />}</>;
};

const DotInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo } = useChartState() as LinesState;

  const { xAnchor, yAnchor, datum } = getAnnotationInfo(d);
  const { margins } = useBounds();

  return (
    <Box
      style={{
        left: xAnchor + margins.left,
        top: yAnchor + margins.top,
        backgroundColor: datum.color
      }}
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        position: "absolute",
        transform: "translate3d(-50%, -50%, 0)",
        pointerEvents: "none"
      }}
    />
  );
};
