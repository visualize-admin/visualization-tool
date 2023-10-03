import { axisLeft, axisRight } from "d3";
import { useEffect, useRef } from "react";

import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { getTickNumber } from "@/charts/shared/ticks";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";
import { getTextWidth } from "@/utils/get-text-width";

type AxisHeightLinearDualProps = {
  orientation: "left" | "right";
};

export const AxisHeightLinearDual = (props: AxisHeightLinearDualProps) => {
  const { orientation } = props;
  const leftAligned = orientation === "left";
  const { labelFontSize, axisLabelFontSize, fontFamily } = useChartTheme();
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const { y, yOrientationScales, colors, bounds } =
    useChartState() as ComboLineDualState;
  const { margins } = bounds;
  const ticks = getTickNumber(bounds.chartHeight);

  const axisTitleWidth =
    getTextWidth(leftAligned ? y.lineLeft.label : y.lineRight.label, {
      fontSize: axisLabelFontSize,
    }) + TICK_PADDING;

  const color = colors(leftAligned ? y.lineLeft.label : y.lineRight.label);

  useEffect(() => {
    if (ref.current) {
      const makeAxis = (leftAligned ? axisLeft : axisRight)(
        yOrientationScales[orientation]
      )
        .ticks(ticks)
        .tickSizeInner(leftAligned ? -bounds.chartWidth : bounds.chartWidth)
        .tickFormat(formatNumber)
        .tickPadding(TICK_PADDING);
      const g = renderContainer(ref.current, {
        id: `axis-height-linear-${orientation}`,
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(makeAxis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(makeAxis),
          }),
      });

      g.select(".domain").remove();
      g.selectAll(".tick line")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.1);
      g.selectAll(".tick text")
        .attr("dy", 3)
        .attr("fill", color)
        .attr("font-family", fontFamily)
        .style("font-size", labelFontSize)
        .attr("text-anchor", leftAligned ? "end" : "start");
    }
  }, [
    bounds.chartWidth,
    enableTransition,
    fontFamily,
    labelFontSize,
    margins.left,
    margins.top,
    ticks,
    transitionDuration,
    orientation,
    yOrientationScales,
    color,
    formatNumber,
    leftAligned,
  ]);

  return (
    <>
      <foreignObject
        x={leftAligned ? 0 : bounds.chartWidth - margins.right}
        width={axisTitleWidth}
        height={axisLabelFontSize * 2}
        color={color}
      >
        <OpenMetadataPanelWrapper
          dim={leftAligned ? y.lineLeft.dimension : y.lineRight.dimension}
        >
          <span style={{ fontSize: axisLabelFontSize }}>
            {leftAligned ? y.lineLeft.label : y.lineRight.label}
          </span>
        </OpenMetadataPanelWrapper>
      </foreignObject>

      <g ref={ref} />
    </>
  );
};
