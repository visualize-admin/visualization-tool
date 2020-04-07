import React from "react";
import { Box } from "theme-ui";
import { Observation } from "../../../domain/data";
import { LinesState } from "../lines/lines-state";
import { Margins } from "../use-width";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { TooltipValue, TooltipPlacement } from "./tooltip";

export const Ruler = () => {
  const [state] = useInteraction();
  const { visible, d } = state.annotation;
  return <>{visible && d && <RulerInner d={d} />}</>;
};

const RulerInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;
  const {
    xAnchor,
    yAnchor,
    xValue,
    datum,
    placement,
    values,
  } = getAnnotationInfo(d);

  return (
    <RulerContent
      xValue={xValue}
      values={values}
      chartHeight={bounds.chartHeight}
      margins={bounds.margins}
      xAnchor={xAnchor}
      yAnchor={yAnchor}
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
  yAnchor: number;
  datum: TooltipValue;
  placement: TooltipPlacement;
}

export const RulerContent = ({
  xValue,
  values,
  chartHeight,
  margins,
  xAnchor,
  yAnchor,
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
          borderColor: "monochrome.200",
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
          bg: "monochrome100",
          transform: "translateX(-50%)",
          px: 1,
          fontSize: 3,
          color: "monochrome800",
        }}
      >
        {xValue}
      </Box>
    </>
  );
};
