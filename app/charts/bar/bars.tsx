import { useEffect, useMemo, useRef } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useBarValueLabelsData } from "@/charts/bar/show-values-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderTotalValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderContainerOptions,
  renderHorizontalWhisker,
  RenderHorizontalWhiskerDatum,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    getY,
    getXErrorPresent,
    getXErrorRange,
    chartData,
    yScale,
    xScale,
    showXUncertainty,
    bounds,
  } = useChartState() as BarsState;
  const { margins, width, chartHeight } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData = useMemo(() => {
    if (!getXErrorRange || !showXUncertainty) {
      return [];
    }

    const bandwidth = yScale.bandwidth();

    return chartData.filter(getXErrorPresent).map((d, i) => {
      const y0 = yScale(getY(d)) as number;
      const barHeight = Math.min(bandwidth, 16);
      const [x1, x2] = getXErrorRange(d);

      return {
        key: `${i}`,
        y: y0 + bandwidth / 2 - barHeight / 2,
        x1: xScale(x1),
        x2: xScale(x2),
        height: barHeight,
      } satisfies RenderHorizontalWhiskerDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartData,
    getY,
    getXErrorPresent,
    getXErrorRange,
    showXUncertainty,
    xScale,
    yScale,
    width,
    chartHeight,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-error-whiskers",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderHorizontalWhisker(g, renderData, opts),
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

export const Bars = () => {
  const {
    chartData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    getRenderingKey,
    colors,
    rotateValues,
  } = useChartState() as BarsState;
  const { margins } = bounds;
  const { labelFontSize, fontFamily } = useChartTheme();
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = yScale.bandwidth();
  const x0 = xScale(0);
  const renderData = useMemo(() => {
    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const yScaled = yScale(getY(d)) as number;
      const xRaw = getX(d);
      const x = xRaw === null || isNaN(xRaw) ? 0 : xRaw;
      const xScaled = xScale(x);
      const xRender = xScale(Math.min(x, 0));
      const width = Math.max(0, Math.abs(xScaled - x0));

      return {
        key,
        x: xRender,
        y: yScaled,
        width,
        height: bandwidth,
        // Calling colors(key) directly results in every key being added to the domain,
        // which is not what we want.
        color: colors.copy()(key),
      } satisfies RenderBarDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bounds.width,
    chartData,
    bandwidth,
    getX,
    getY,
    xScale,
    yScale,
    x0,
    getRenderingKey,
  ]);

  const valueLabelsData = useBarValueLabelsData();

  useEffect(() => {
    const g = ref.current;

    if (g) {
      const common: Pick<
        RenderContainerOptions,
        "id" | "transform" | "transition"
      > = {
        id: "bars",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: {
          enable: enableTransition,
          duration: transitionDuration,
        },
      };
      renderContainer(g, {
        ...common,
        render: (g, opts) => renderBars(g, renderData, { ...opts, x0 }),
      });
      renderContainer(g, {
        ...common,
        render: (g, opts) =>
          renderTotalValueLabels(g, valueLabelsData, {
            ...opts,
            rotate: rotateValues,
            textAnchor: "start",
            dx: 6,
            dy: 4,
            fontFamily,
            fontSize: labelFontSize,
          }),
      });
    }
  }, [
    enableTransition,
    fontFamily,
    labelFontSize,
    margins.left,
    margins.top,
    renderData,
    rotateValues,
    transitionDuration,
    valueLabelsData,
    x0,
  ]);

  return <g ref={ref} />;
};
