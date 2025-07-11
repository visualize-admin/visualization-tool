import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  TooltipPlacement,
  TooltipValue,
} from "@/charts/shared/interaction/tooltip";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Margins } from "@/charts/shared/use-size";
import { Observation } from "@/domain/data";
import { useIsMobile } from "@/utils/use-is-mobile";

type RulerProps = {
  rotate?: boolean;
};

export const Ruler = (props: RulerProps) => {
  const { rotate = false } = props;
  const [{ type, visible, observation }] = useInteraction();

  return (
    <>
      {type === "tooltip" && visible && observation && (
        <RulerInner d={observation} rotate={rotate} />
      )}
    </>
  );
};

type RulerInnerProps = {
  d: Observation;
  rotate: boolean;
};

const RulerInner = (props: RulerInnerProps) => {
  const { d, rotate } = props;
  const { getAnnotationInfo, bounds } = useChartState() as
    | LinesState
    | ComboLineSingleState
    | ComboLineDualState
    | ComboLineColumnState;
  const { xAnchor, value, datum, placement, values } = getAnnotationInfo(d);

  return (
    <RulerContent
      rotate={rotate}
      xValue={value}
      values={values}
      chartHeight={bounds.chartHeight}
      margins={bounds.margins}
      xAnchor={xAnchor}
      datum={datum}
      placement={placement}
    />
  );
};

type RulerContentProps = {
  rotate: boolean;
  xValue: string;
  values: TooltipValue[] | undefined;
  chartHeight: number;
  margins: Margins;
  xAnchor: number;
  datum: TooltipValue;
  placement: TooltipPlacement;
  showXValue?: boolean;
};

const useStyles = makeStyles<Theme, { rotate: boolean }>((theme: Theme) => ({
  left: {
    width: 0,
    position: "absolute",
    borderWidth: 0.5,
    borderStyle: "solid",
    borderColor: theme.palette.cobalt[50],
    pointerEvents: "none",
    transform: "translateX(-50%)",
  },
  right: {
    position: "absolute",
    fontWeight: "bold",
    backgroundColor: theme.palette.background.paper,
    transform: ({ rotate }) =>
      rotate
        ? "translateX(-50%) translateY(50%) rotate(90deg)"
        : "translateX(-50%)",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: "0.875rem",
  },
}));

export const RulerContent = (props: RulerContentProps) => {
  const { rotate, xValue, chartHeight, margins, xAnchor } = props;
  const classes = useStyles({ rotate });
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className={classes.left}
        style={{
          height: chartHeight,
          left: xAnchor + margins.left,
          top: margins.top,
        }}
      />
      {!isMobile && (
        <div
          className={classes.right}
          style={{
            left: xAnchor + margins.left,
            top: chartHeight + margins.top + 6,
          }}
        >
          {xValue}
        </div>
      )}
    </>
  );
};
