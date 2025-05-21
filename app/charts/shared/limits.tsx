import { useEffect, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { BarsState } from "@/charts/bar/bars-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  renderContainer,
  RenderHorizontalLimitDatum,
  renderHorizontalLimits,
  RenderVerticalLimitDatum,
  renderVerticalLimits,
} from "@/charts/shared/rendering-utils";
import { useLimits } from "@/config-utils";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useTransitionStore } from "@/stores/transition";

export const HorizontalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { yScale, getY, xScale, bounds } = useChartState() as BarsState;
  const { width, height, chartHeight, margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderHorizontalLimitDatum[] = useMemo(() => {
    const limitHeight = yScale.bandwidth();
    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        return {
          x1:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.min,
          x2:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.max,
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map((limit) => {
        const key = limit.related.map((d) => d.dimensionId + d.value).join();
        const x1 = xScale(limit.x1);
        const x2 = xScale(limit.x2);
        const fill = limit.color;
        const lineType = limit.lineType;

        const axisObservation: Observation = {
          [axisDimension?.id ?? ""]: limit.relatedAxisDimensionValueLabel ?? "",
        };
        const axisY = yScale(getY(axisObservation));
        const y = axisY ?? 0;
        const height = axisY !== undefined ? limitHeight : chartHeight;

        const hasValidAxis = axisY !== undefined;
        const hasNoAxis = limit.relatedAxisDimensionValueLabel === undefined;

        return hasValidAxis || hasNoAxis
          ? ({
              key,
              x1,
              x2,
              y,
              height,
              fill,
              lineType,
            } as RenderHorizontalLimitDatum)
          : null;
      })
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    axisDimension?.values,
    axisDimension?.id,
    getY,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "horizontal-limits",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderHorizontalLimits(g, renderData, opts),
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

export const VerticalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { xScale, getX, yScale, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | LinesState;
  const { margins, chartWidth, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderVerticalLimitDatum[] = useMemo(() => {
    const { bandwidth, limitWidth } =
      "bandwidth" in xScale
        ? {
            bandwidth: xScale.bandwidth(),
            limitWidth: xScale.bandwidth(),
          }
        : {
            bandwidth: 0,
            limitWidth: 15,
          };

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        return {
          y1:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.min,
          y2:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.max,
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map((limit) => {
        const key = limit.related.map((d) => d.dimensionId + d.value).join();
        const y1 = yScale(limit.y1);
        const y2 = yScale(limit.y2);
        const fill = limit.color;
        const lineType = limit.lineType;
        const symbolType = limit.symbolType;

        const axisObservation: Observation = {
          [axisDimension?.id ?? ""]: limit.relatedAxisDimensionValueLabel ?? "",
        };
        const axisX = xScale(getX(axisObservation) as $IntentionalAny);
        const x =
          axisX !== undefined ? axisX + (bandwidth - limitWidth) * 0.5 : 0;
        const width = axisX !== undefined ? limitWidth : chartWidth;

        const hasValidAxis = axisX !== undefined;
        const hasNoAxis = limit.relatedAxisDimensionValueLabel === undefined;

        return hasValidAxis || hasNoAxis
          ? ({
              key,
              x,
              y1,
              y2,
              width,
              fill,
              lineType,
              symbolType,
            } as RenderVerticalLimitDatum)
          : null;
      })
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    axisDimension?.values,
    axisDimension?.id,
    getX,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "vertical-limits",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderVerticalLimits(g, renderData, opts),
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
