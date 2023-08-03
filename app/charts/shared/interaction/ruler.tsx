import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  TooltipPlacement,
  TooltipValue,
} from "@/charts/shared/interaction/tooltip";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Margins } from "@/charts/shared/use-width";
import { Observation } from "@/domain/data";

export const Ruler = () => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;
  return <>{visible && d && <RulerInner d={d} />}</>;
};

const RulerInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;
  const { xAnchor, xValue, datum, placement, values } = getAnnotationInfo(d);

  return (
    <RulerContent
      xValue={xValue}
      values={values}
      chartHeight={bounds.chartHeight}
      margins={bounds.margins}
      xAnchor={xAnchor}
      datum={datum}
      placement={placement}
    />
  );
};

interface RulerContentProps {
  xValue: string;
  values: TooltipValue[] | undefined;
  chartHeight: number;
  margins: Margins;
  xAnchor: number;
  datum: TooltipValue;
  placement: TooltipPlacement;
}

const useStyles = makeStyles((theme: Theme) => ({
  left: {
    width: 0,
    position: "absolute",
    borderWidth: 0.5,
    borderStyle: "solid",
    borderColor: theme.palette.grey[200],
    pointerEvents: "none",
    transform: "translateX(-50%)",
  },
  right: {
    position: "absolute",
    fontWeight: "bold",
    backgroundColor: theme.palette.grey[100],
    transform: "translateX(-50%)",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: "0.875rem",
    color: theme.palette.grey[800],
  },
}));

export const RulerContent = ({
  xValue,
  chartHeight,
  margins,
  xAnchor,
}: RulerContentProps) => {
  const classes = useStyles();
  return (
    <>
      <Box
        className={classes.left}
        style={{
          height: chartHeight,
          left: xAnchor + margins.left,
          top: margins.top,
        }}
      />
      <Box
        className={classes.right}
        style={{
          left: xAnchor + margins.left,
          top: chartHeight + margins.top + 6,
        }}
      >
        {xValue}
      </Box>
    </>
  );
};
