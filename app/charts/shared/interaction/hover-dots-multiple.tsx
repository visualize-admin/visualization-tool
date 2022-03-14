import { Fragment } from "react";
import { Box } from "@mui/material";
import { Observation } from "../../../domain/data";
import { LinesState } from "../../line/lines-state";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";

export const HoverDotMultiple = () => {
  const [state] = useInteraction();

  const { visible, d } = state.interaction;

  return <>{visible && d && <HoverDots d={d} />}</>;
};

const HoverDots = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;

  const { xAnchor, values } = getAnnotationInfo(d);

  return (
    <>
      {values &&
        values.map((value, i) => (
          <Fragment key={i}>
            {!value.hide && (
              <Box
                style={{
                  backgroundColor: value.color,
                  left: xAnchor + bounds.margins.left,
                  top: value.yPos! + bounds.margins.top,
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
                  pointerEvents: "none",
                }}
              />
            )}
          </Fragment>
        ))}
    </>
  );
};
