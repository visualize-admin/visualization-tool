import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Fragment } from "react";

import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const HoverDotMultiple = () => {
  const [{ type, visible, observation }] = useInteraction();

  return (
    <>
      {type === "tooltip" && visible && observation && (
        <HoverDots d={observation} />
      )}
    </>
  );
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
  const { getAnnotationInfo, bounds } = useChartState() as
    | LinesState
    | ComboLineSingleState;
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
                  top:
                    value.yPos! +
                    bounds.margins.top +
                    (bounds.yAxisTitleHeight || 0),
                }}
                className={classes.dot}
              />
            )}
          </Fragment>
        ))}
    </>
  );
};
