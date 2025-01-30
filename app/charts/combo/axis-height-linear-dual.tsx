import { useState } from "react";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import {
  TICK_PADDING,
  useRenderAxisHeightLinear,
} from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { DISABLE_SCREENSHOT_COLOR_WIPE_ATTR } from "@/components/chart-shared";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { theme } from "@/themes/federal";
import { getTextWidth } from "@/utils/get-text-width";
import { useAxisTitleAdjustments } from "@/utils/use-axis-title-adjustments";

import { TITLE_VPADDING } from "./combo-line-container";

const TITLE_HPADDING = 8;
const TOP_MARGIN = 4;

type AxisHeightLinearDualProps = {
  orientation?: "left" | "right";
};

export const AxisHeightLinearDual = (props: AxisHeightLinearDualProps) => {
  const { orientation = "left" } = props;
  const leftAligned = orientation === "left";

  const { gridColor, labelColor, axisLabelFontSize } = useChartTheme();
  const [ref, setRef] = useState<SVGGElement | null>(null);
  const { y, yOrientationScales, colors, bounds, maxRightTickWidth } =
    useChartState() as ComboLineDualState | ComboLineColumnState;

  const yScale = yOrientationScales[orientation];
  const { margins } = bounds;
  const axisTitle = y[orientation].label;
  const axisTitleWidth =
    getTextWidth(axisTitle, { fontSize: axisLabelFontSize }) + TICK_PADDING;
  const color = colors(axisTitle);

  const { isOverlapping, overlapAmount } = useAxisTitleAdjustments({
    leftAxisTitle: y.left.label,
    rightAxisTitle: y.right.label,
    containerWidth: bounds.chartWidth,
    fontSize: axisLabelFontSize,
  });

  useRenderAxisHeightLinear(ref, {
    id: `axis-height-linear-${orientation}`,
    orientation,
    scale: yScale,
    width: bounds.chartWidth,
    height: bounds.chartHeight,
    margins,
    lineColor: gridColor,
    textColor: labelColor,
  });

  const rightXAlignment =
    bounds.chartWidth +
    margins.left -
    (isOverlapping ? axisTitleWidth / overlapAmount : axisTitleWidth) +
    maxRightTickWidth +
    TICK_PADDING -
    TITLE_HPADDING * (isOverlapping ? Math.floor(overlapAmount) : 2);

  const titleWidth = isOverlapping ? axisTitleWidth / overlapAmount : "auto";

  return (
    <>
      <foreignObject
        x={leftAligned ? 0 : rightXAlignment}
        width={axisTitleWidth + TITLE_HPADDING * 2}
        height={
          (isOverlapping
            ? axisLabelFontSize * Math.ceil(overlapAmount) + TITLE_VPADDING
            : axisLabelFontSize + TITLE_VPADDING) *
            2 +
          TOP_MARGIN
        }
        color={theme.palette.getContrastText(color)}
        style={{ display: "flex" }}
      >
        <OpenMetadataPanelWrapper component={y[orientation].dimension}>
          <span
            {...DISABLE_SCREENSHOT_COLOR_WIPE_ATTR}
            style={{
              width: titleWidth,
              fontSize: axisLabelFontSize,
              backgroundColor: color,
              color: theme.palette.getContrastText(color),
              padding: `${TITLE_VPADDING}px ${TITLE_HPADDING}px`,
              borderRadius: 4,
              wordBreak: "break-word",
            }}
          >
            {axisTitle}
          </span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g ref={(newRef) => setRef(newRef)} />
    </>
  );
};
