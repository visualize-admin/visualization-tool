import { ReactNode } from "react";

import { getTextHeight, getTextWidth } from "@/utils/get-text-width";

import { TICK_PADDING } from "../shared/axis-height-linear";
import { useChartState } from "../shared/chart-state";
import { useChartTheme } from "../shared/use-chart-theme";

import { ComboLineColumnState } from "./combo-line-column-state";
import { ComboLineDualState } from "./combo-line-dual-state";

export const TITLE_VPADDING = 4;

export const ComboLineContainer = ({ children }: { children: ReactNode }) => {
  const { axisLabelFontSize } = useChartTheme();
  const { y, bounds } = useChartState() as
    | ComboLineDualState
    | ComboLineColumnState;
  const axisTitle = y.left.label;
  const axisTitleWidth =
    getTextWidth(axisTitle, { fontSize: axisLabelFontSize }) + TICK_PADDING;
  const otherAxisTitle = y.right.label;
  const otherAxisTitleWidth =
    getTextWidth(otherAxisTitle, { fontSize: axisLabelFontSize }) +
    TICK_PADDING;
  const overLappingTitles =
    axisTitleWidth + otherAxisTitleWidth > bounds.chartWidth;

  const axisLabelHeight = getTextHeight(axisTitle, {
    fontSize: axisLabelFontSize,
  });

  const yAdjustment = overLappingTitles
    ? (axisLabelHeight + TITLE_VPADDING) * 2
    : 0;
  return <g transform={`translate(0, ${yAdjustment})`}>{children}</g>;
};
