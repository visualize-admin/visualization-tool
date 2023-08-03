import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Fragment } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const HoverDotMultiple = () => {
  const [state] = useInteraction();

  const { visible, d } = state.interaction;

  return <>{visible && d && <HoverDots d={d} />}</>;
};

const useStyles = makeStyles((theme: Theme) => ({
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.grey[100],
    transform: "translate3d(-50%, -50%, 0)",
    pointerEvents: "none",
  },
}));

const HoverDots = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;

  const { xAnchor, values } = getAnnotationInfo(d);
  const classes = useStyles();

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
                className={classes.dot}
              />
            )}
          </Fragment>
        ))}
    </>
  );
};
