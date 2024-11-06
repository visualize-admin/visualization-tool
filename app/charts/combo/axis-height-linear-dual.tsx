import { useState } from "react";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import {
  TICK_PADDING,
  useRenderAxisHeightLinear,
} from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { theme } from "@/themes/base";
import { getTextWidth } from "@/utils/get-text-width";

import { TITLE_VPADDING } from "./combo-line-container";
const TITLE_HPADDING = 8;

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
  const otherAxisTitle = y[leftAligned ? "right" : "left"].label;
  const otherAxisTitleWidth =
    getTextWidth(otherAxisTitle, { fontSize: axisLabelFontSize }) +
    TICK_PADDING;
  const overLappingTitles =
    axisTitleWidth + otherAxisTitleWidth > bounds.chartWidth;
  const overLappingAmount =
    (axisTitleWidth + otherAxisTitleWidth) / bounds.chartWidth;

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
    (overLappingTitles ? axisTitleWidth / overLappingAmount : axisTitleWidth) +
    // Align the title with the rightmost tick.
    maxRightTickWidth +
    TICK_PADDING -
    TITLE_HPADDING * (overLappingTitles ? Math.floor(overLappingAmount) : 2);

  return (
    <>
      <foreignObject
        x={leftAligned ? 0 : rightXAlignment}
        width={axisTitleWidth + TITLE_HPADDING * 2}
        height={
          (overLappingTitles
            ? axisLabelFontSize * Math.ceil(overLappingAmount)
            : axisLabelFontSize + TITLE_VPADDING) * 2
        }
        color={theme.palette.getContrastText(color)}
        style={{ display: "flex" }}
      >
        <OpenMetadataPanelWrapper component={y[orientation].dimension}>
          <span
            style={{
              width: overLappingTitles
                ? axisTitleWidth / overLappingAmount
                : "auto",
              fontSize: axisLabelFontSize,
              backgroundColor: color,
              color: theme.palette.getContrastText(color),
              paddingTop: TITLE_VPADDING,
              paddingBottom: TITLE_VPADDING,
              paddingLeft: TITLE_HPADDING,
              paddingRight: TITLE_HPADDING,
              borderRadius: 4,
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
