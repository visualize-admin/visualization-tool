import { TITLE_VPADDING } from "@/charts/combo/combo-line-container";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { getTextHeight, getTextWidth } from "@/utils/get-text-width";

export interface AxisTitleAdjustments {
  axisTitleAdjustment: number;
  topMarginAxisTitleAdjustment: number;
  isOverlapping: boolean;
  overlapAmount: number;
}

interface UseAxisTitleAdjustmentsProps {
  leftAxisTitle: string;
  rightAxisTitle: string;
  containerWidth: number;
  fontSize?: number;
}

export const useAxisTitleAdjustments = ({
  leftAxisTitle,
  rightAxisTitle,
  containerWidth,
  fontSize = TICK_FONT_SIZE,
}: UseAxisTitleAdjustmentsProps): AxisTitleAdjustments => {
  const axisTitleWidthLeft =
    getTextWidth(leftAxisTitle, { fontSize }) + TICK_PADDING;
  const axisTitleWidthRight =
    getTextWidth(rightAxisTitle, { fontSize }) + TICK_PADDING;

  const isOverlapping =
    axisTitleWidthLeft + axisTitleWidthRight > containerWidth;
  const overlapAmount =
    (axisTitleWidthLeft + axisTitleWidthRight) / containerWidth;

  const axisLabelHeight = getTextHeight(leftAxisTitle, { fontSize });

  const axisTitleAdjustment =
    (isOverlapping
      ? axisLabelHeight * Math.ceil(overlapAmount)
      : axisLabelHeight + TITLE_VPADDING) *
      2 -
    axisLabelHeight * 2;

  const topMarginAxisTitleAdjustment = 60 + axisTitleAdjustment;

  return {
    axisTitleAdjustment,
    topMarginAxisTitleAdjustment,
    isOverlapping,
    overlapAmount,
  };
};
