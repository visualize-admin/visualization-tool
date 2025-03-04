import { useEffect, useMemo, useRef } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import { useRenderColumnValueLabelsData } from "@/charts/column/render-value-labels";
import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderContainerOptions,
  RenderVerticalWhiskerDatum,
  renderVerticalWhiskers,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    getX,
    getYErrorPresent,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYUncertainty,
    bounds,
  } = useChartState() as ColumnsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = xScale.bandwidth();
  const renderData: RenderVerticalWhiskerDatum[] = useMemo(() => {
    if (!getYErrorRange || !showYUncertainty) {
      return [];
    }

    return chartData.filter(getYErrorPresent).map((d, i) => {
      const x0 = xScale(getX(d)) as number;
      const barWidth = Math.min(bandwidth, 15);
      const [y1, y2] = getYErrorRange(d);

      return {
        key: `${i}`,
        x: x0 + bandwidth / 2 - barWidth / 2,
        y1: yScale(y1),
        y2: yScale(y2),
        width: barWidth,
      } as RenderVerticalWhiskerDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getYErrorRange,
    showYUncertainty,
    chartData,
    getYErrorPresent,
    xScale,
    getX,
    bandwidth,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns-error-whiskers",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderVerticalWhiskers(g, renderData, opts),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
  ]);

  return <g ref={ref} />;
};

export const Columns = () => {
  const {
    chartData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    getRenderingKey,
    colors,
    showValues,
    rotateValues,
  } = useChartState() as ColumnsState;
  const { margins } = bounds;
  const { labelFontSize, fontFamily } = useChartTheme();
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const columnsData: RenderColumnDatum[] = useMemo(() => {
    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const valueRaw = getY(d);
      const xScaled = xScale(getX(d)) as number;
      const value = valueRaw === null || isNaN(valueRaw) ? 0 : valueRaw;
      const y = yScale(value);
      const yRender = yScale(Math.max(value, 0));
      const height = Math.max(0, Math.abs(y - y0));
      // Calling colors(key) directly results in every key being added to the domain,
      // which is not what we want.
      const color = colors.copy()(key);

      return {
        key,
        value,
        x: xScaled,
        y: yRender,
        width: bandwidth,
        height,
        color,
      };
    });
  }, [
    chartData,
    bandwidth,
    getX,
    getY,
    xScale,
    yScale,
    y0,
    colors,
    getRenderingKey,
  ]);

  const valueLabelsData = useRenderColumnValueLabelsData();

  useEffect(() => {
    const g = ref.current;

    if (g) {
      const common: Pick<
        RenderContainerOptions,
        "id" | "transform" | "transition"
      > = {
        id: "columns",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: {
          enable: enableTransition,
          duration: transitionDuration,
        },
      };
      renderContainer(g, {
        ...common,
        render: (g, opts) => renderColumns(g, columnsData, { ...opts, y0 }),
      });
      renderContainer(g, {
        ...common,
        render: (g, opts) =>
          renderValueLabels(g, valueLabelsData, {
            ...opts,
            rotate: rotateValues,
            fontFamily,
            fontSize: labelFontSize,
          }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    columnsData,
    transitionDuration,
    y0,
    showValues,
    valueLabelsData,
    labelFontSize,
    rotateValues,
    fontFamily,
  ]);

  return <g ref={ref} />;
};
