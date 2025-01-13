import { TITLE_VPADDING } from "@/charts/combo/combo-line-container";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { getTextWidth } from "@/utils/get-text-width";

type AxisTitleAdjustments = {
  axisTitleAdjustment: number;
  topMarginAxisTitleAdjustment: number;
  isOverlapping: boolean;
  overlapAmount: number;
};

type UseAxisTitleAdjustmentsProps = {
  leftAxisTitle: string;
  rightAxisTitle: string;
  containerWidth: number;
  fontSize?: number;
};

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

  const axisTitleAdjustment =
    (isOverlapping
      ? fontSize * Math.ceil(overlapAmount)
      : fontSize + TITLE_VPADDING) *
      2 -
    fontSize * 2;

  const topMarginAxisTitleAdjustment = 60 + axisTitleAdjustment;

  return {
    axisTitleAdjustment,
    topMarginAxisTitleAdjustment,
    isOverlapping,
    overlapAmount,
  };
};
