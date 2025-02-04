import { useState } from "react";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import {
  TITLE_H_PADDING,
  TITLE_V_PADDING,
  useAxisTitleSize,
} from "@/charts/combo/shared";
import {
  TICK_PADDING,
  useRenderAxisHeightLinear,
} from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { DISABLE_SCREENSHOT_COLOR_WIPE_ATTR } from "@/components/chart-shared";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { theme } from "@/themes/federal";

type AxisHeightLinearDualProps = {
  orientation?: "left" | "right";
};

export const AxisHeightLinearDual = (props: AxisHeightLinearDualProps) => {
  const { orientation = "left" } = props;
  const leftAligned = orientation === "left";

  const { gridColor, labelColor, axisLabelFontSize } = useChartTheme();
  const [ref, setRef] = useState<SVGGElement | null>(null);
  const { y, yOrientationScales, colors, bounds } = useChartState() as
    | ComboLineDualState
    | ComboLineColumnState;

  const yScale = yOrientationScales[orientation];
  const { width, chartWidth, chartHeight, margins } = bounds;
  const axisTitle = y[orientation].label;
  const color = colors(axisTitle);
  useRenderAxisHeightLinear(ref, {
    id: `axis-height-linear-${orientation}`,
    orientation,
    scale: yScale,
    width: chartWidth,
    height: chartHeight,
    margins,
    lineColor: gridColor,
    textColor: labelColor,
  });

  const { width: axisTitleWidth, height: axisTitleHeight } = useAxisTitleSize(
    axisTitle,
    { width: width * 0.5 - TICK_PADDING }
  );

  const axisTitleX = leftAligned ? 0 : width - axisTitleWidth;

  return (
    <>
      <foreignObject
        data-testid={`axis-title-${orientation}`}
        x={axisTitleX}
        width={axisTitleWidth}
        height={axisTitleHeight}
        color={theme.palette.getContrastText(color)}
      >
        <OpenMetadataPanelWrapper component={y[orientation].dimension}>
          <span
            {...DISABLE_SCREENSHOT_COLOR_WIPE_ATTR}
            style={{
              width: "100%",
              fontSize: axisLabelFontSize,
              backgroundColor: color,
              color: theme.palette.getContrastText(color),
              padding: `${TITLE_V_PADDING}px ${TITLE_H_PADDING}px`,
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
