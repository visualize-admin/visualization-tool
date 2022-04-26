import { Box } from "@mui/material";
import * as React from "react";

import { LinesState } from "@/charts/line/lines-state";
import {
  TooltipValue,
  TooltipPlacement,
} from "@/charts/shared/interaction/tooltip";
import { useChartState } from "@/charts/shared/use-chart-state";
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

export const RulerContent = ({
  xValue,
  values,
  chartHeight,
  margins,
  xAnchor,
  datum,
  placement,
}: RulerContentProps) => {
  return (
    <>
      <Box
        style={{
          height: chartHeight,
          left: xAnchor + margins.left,
          top: margins.top,
        }}
        sx={{
          width: 0,
          position: "absolute",
          borderWidth: 0.5,
          borderStyle: "solid",
          borderColor: "grey.200",
          pointerEvents: "none",
          transform: "translateX(-50%)",
        }}
      />
      <Box
        style={{
          left: xAnchor + margins.left,
          top: chartHeight + margins.top + 6,
        }}
        sx={{
          position: "absolute",
          fontWeight: "bold",
          backgroundColor: "grey.100",
          transform: "translateX(-50%)",
          px: 1,
          fontSize: "0.875rem",
          color: "grey.800",
        }}
      >
        {xValue}
      </Box>
    </>
  );
};
