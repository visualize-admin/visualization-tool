import { alpha } from "@mui/material";
import React from "react";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import {
  TICK_PADDING,
  useRenderAxisHeightLinear,
} from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { getTextWidth } from "@/utils/get-text-width";

type AxisHeightLinearDualProps = {
  orientation?: "left" | "right";
};

export const AxisHeightLinearDual = (props: AxisHeightLinearDualProps) => {
  const { orientation = "left" } = props;
  const leftAligned = orientation === "left";
  const { axisLabelFontSize } = useChartTheme();
  const [ref, setRef] = React.useState<SVGGElement | null>(null);
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
    orientation: orientation,
    scale: yScale,
    width: bounds.chartWidth,
    height: bounds.chartHeight,
    margins: bounds.margins,
    lineColor: alpha(color, 0.1),
    textColor: color,
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
              TICK_PADDING
        }
        width={axisTitleWidth}
        height={axisLabelFontSize * 2}
        color={color}
      >
        <OpenMetadataPanelWrapper dim={y[orientation].dimension}>
          <span style={{ fontSize: axisLabelFontSize }}>{axisTitle}</span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g ref={(newRef) => setRef(newRef)} />
    </>
  );
};
