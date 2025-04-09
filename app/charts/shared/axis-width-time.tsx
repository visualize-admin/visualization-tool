import { axisBottom } from "d3-axis";
import { useEffect, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { useXAxisTitleOffset } from "@/charts/shared/chart-dimensions";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatShortDateAuto } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";

// Approximate the longest date format we're using for.
// Roughly equivalent to the text width of "99.99.9999" with 12px font size.
const MAX_DATE_LABEL_LENGTH = 70;

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatDateAuto = useFormatShortDateAuto();
  const {
    xScale,
    yScale,
    bounds,
    xDimension,
    xAxisLabel,
    bottomAxisLabelSize,
  } = useChartState() as
    | LinesState
    | AreasState
    | ComboLineSingleState
    | ComboLineDualState;
  const { chartHeight, chartWidth, margins } = bounds;
  const {
    labelColor,
    gridColor,
    domainColor,
    labelFontSize,
    fontFamily,
    axisLabelFontSize,
  } = useChartTheme();
  const xAxisTitleOffset = useXAxisTitleOffset();
  const hasNegativeValues = yScale.domain()[0] < 0;
  const ticks = bounds.chartWidth / (MAX_DATE_LABEL_LENGTH + 20);

  useEffect(() => {
    if (ref.current) {
      const axis = axisBottom(xScale)
        .ticks(ticks)
        .tickFormat((x) => formatDateAuto(x as Date));
      const g = renderContainer(ref.current, {
        id: "axis-width-time",
        transform: `translate(${margins.left} ${chartHeight + margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.select(".domain").remove();
      g.selectAll(".tick line").attr(
        "stroke",
        hasNegativeValues ? gridColor : domainColor
      );
      g.selectAll(".tick text")
        .attr("font-size", labelFontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor);
    }
  }, [
    chartHeight,
    domainColor,
    enableTransition,
    fontFamily,
    formatDateAuto,
    gridColor,
    hasNegativeValues,
    labelColor,
    labelFontSize,
    margins.left,
    margins.top,
    ticks,
    transitionDuration,
    xScale,
  ]);

  return (
    <>
      <foreignObject
        x={margins.left + chartWidth / 2 - bottomAxisLabelSize.width / 2}
        y={margins.top + chartHeight + xAxisTitleOffset}
        width={chartWidth}
        height={bottomAxisLabelSize.height}
        style={{ display: "flex" }}
      >
        <OpenMetadataPanelWrapper component={xDimension}>
          <span style={{ fontSize: axisLabelFontSize, lineHeight: 1.5 }}>
            {xAxisLabel}
          </span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g ref={ref} />
    </>
  );
};

export const AxisTimeDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds } = useChartState() as
    | LinesState
    | AreasState
    | ComboLineSingleState
    | ComboLineDualState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const axis = axisBottom(xScale).tickSizeOuter(0);
      const g = renderContainer(ref.current, {
        id: "axis-width-time-domain",
        transform: `translate(${margins.left} ${chartHeight + margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.selectAll(".tick line").remove();
      g.selectAll(".tick text").remove();
      g.select(".domain")
        .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
        .attr("stroke", domainColor)
        .attr("stroke-linecap", "round");
    }
  });

  return <g ref={ref} />;
};
