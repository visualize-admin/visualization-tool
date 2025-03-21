import { getContrastingColor } from "@uiw/react-color";
import { useEffect, useMemo, useRef } from "react";

import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const BarsStacked = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const {
    bounds,
    getY,
    xScale,
    yScale,
    colors,
    series,
    getRenderingKey,
    showValuesBySegmentMapping,
    segmentsByAbbreviationOrLabel,
    valueLabelFormatter,
  } = useChartState() as StackedBarsState;
  const { margins, height } = bounds;
  const bandwidth = yScale.bandwidth();
  const x0 = xScale(0);
  const renderData: RenderBarDatum[] = useMemo(() => {
    return series.flatMap((s) => {
      const segmentLabel = s.key;
      const segment =
        segmentsByAbbreviationOrLabel.get(segmentLabel)?.value ?? segmentLabel;
      const color = colors(segmentLabel);

      return s.map((d) => {
        const observation = d.data;
        const value = observation[segmentLabel];
        const valueLabel =
          segment && showValuesBySegmentMapping[segment]
            ? valueLabelFormatter(value)
            : undefined;
        const valueLabelColor = valueLabel
          ? getContrastingColor(color)
          : undefined;

        return {
          key: getRenderingKey(observation, segmentLabel),
          y: yScale(getY(observation)) as number,
          x: xScale(d[0]),
          height: bandwidth,
          width: Math.min(0, xScale(d[0]) - xScale(d[1])) * -1,
          color,
          valueLabel,
          valueLabelColor,
        };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bandwidth,
    colors,
    getY,
    series,
    xScale,
    yScale,
    getRenderingKey,
    // Need to reset the yRange on height change
    height,
    segmentsByAbbreviationOrLabel,
    showValuesBySegmentMapping,
    valueLabelFormatter,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-stacked",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderBars(g, renderData, { ...opts, x0 }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
    x0,
  ]);

  return <g ref={ref} />;
};
