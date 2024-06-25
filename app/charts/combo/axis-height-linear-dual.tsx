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
import { theme } from "@/themes/federal";
import { getTextWidth } from "@/utils/get-text-width";

const TITLE_HPADDING = 8;
const TITLE_VPADDING = 4;

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

  return (
    <>
      <foreignObject
        x={
          leftAligned
            ? 0
            : bounds.chartWidth +
              margins.left -
              axisTitleWidth +
              // Align the title with the rightmost tick.
              maxRightTickWidth +
              TICK_PADDING -
              TITLE_HPADDING * 2
        }
        width={axisTitleWidth + TITLE_HPADDING * 2}
        height={(axisLabelFontSize + TITLE_VPADDING) * 2}
        color={theme.palette.getContrastText(color)}
      >
        <OpenMetadataPanelWrapper component={y[orientation].dimension}>
          <span
            style={{
              fontSize: axisLabelFontSize,
              backgroundColor: color,
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
