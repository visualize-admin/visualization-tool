import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

const useStyles = makeStyles(() => ({
  root: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    position: "absolute",
    transform: "translate3d(-50%, -50%, 0)",
    pointerEvents: "none",
  },
}));

export const HoverDot = () => {
  const [state] = useInteraction();

  const { visible, d } = state.interaction;

  return <>{visible && d && <DotInner d={d} />}</>;
};

const DotInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;

  const { xAnchor, yAnchor, datum } = getAnnotationInfo(d);
  const classes = useStyles();
  return (
    <>
      {yAnchor && (
        <Box
          style={{
            left: xAnchor + bounds.margins.left,
            top: yAnchor + bounds.margins.top,
            backgroundColor: datum.color,
          }}
          className={classes.root}
        />
      )}
    </>
  );
};
