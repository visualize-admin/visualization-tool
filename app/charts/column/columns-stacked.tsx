import { getContrastingColor } from "@uiw/react-color";
import { useEffect, useMemo, useRef } from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ColumnsStacked = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const {
    bounds,
    getX,
    xScale,
    yScale,
    colors,
    series,
    getRenderingKey,
    showValuesBySegmentMapping,
    segmentsByAbbreviationOrLabel,
    valueLabelFormatter,
  } = useChartState() as StackedColumnsState;
  const { margins, height } = bounds;
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = useMemo(() => {
    return series.flatMap((s) => {
      const segmentLabel = s.key;
      const segment = segmentsByAbbreviationOrLabel.get(segmentLabel)?.value;
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
          x: xScale(getX(observation)) as number,
          y: yScale(d[1]),
          width: bandwidth,
          height: Math.max(0, yScale(d[0]) - yScale(d[1])),
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
    getX,
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
        id: "columns-stacked",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderColumns(g, renderData, { ...opts, y0 }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
    y0,
  ]);

  return <g ref={ref} />;
};
