import * as React from "react";
import { Box } from "theme-ui";
import { useInteraction } from "../use-interaction";
import { useBounds } from "../use-bounds";
import { useChartState } from "../use-chart-state";
import { LinesState } from "../lines/lines-state";
import { Observation } from "../../../domain/data";

export const HoverDotMultiple = () => {
  const [state] = useInteraction();

  const { visible, d } = state.annotation;

  return <>{visible && d && <HoverDots d={d} />}</>;
};

const HoverDots = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo } = useChartState() as LinesState;

  const { xAnchor, values } = getAnnotationInfo(d);
  const { margins } = useBounds();

  return (
    <>
      {values &&
        values.map((value, i) => (
          <React.Fragment key={i}>
            <Box
              style={{
                backgroundColor: value.color,
                left: xAnchor + margins.left,
                top: value.yPos! + margins.top
              }}
              sx={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "monochrome100",
                transform: "translate3d(-50%, -50%, 0)",
                pointerEvents: "none"
              }}
            />
          </React.Fragment>
        ))}
    </>
  );
};
