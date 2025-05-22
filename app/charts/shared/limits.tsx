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
        let x1: number;
        let x2: number;

        switch (measureLimit.type) {
          case "single":
            x1 = measureLimit.value;
            x2 = measureLimit.value;
            break;
          case "value-range":
            x1 = measureLimit.min;
            x2 = measureLimit.max;
            break;
          case "time-range":
            x1 = measureLimit.value;
            x2 = measureLimit.value;
            break;
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          x1,
          x2,
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
    const limitWidth = "bandwidth" in xScale ? xScale.bandwidth() : 15;

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        const key = axisDimension?.id ?? "";
        const label = relatedAxisDimensionValueLabel ?? "";
        let x1: $IntentionalAny;
        let x2: $IntentionalAny;
        let y1: number;
        let y2: number;

        switch (measureLimit.type) {
          case "single": {
            x1 = x2 = getX({ [key]: label });
            y1 = y2 = measureLimit.value;
            break;
          }
          case "value-range": {
            x1 = x2 = getX({ [key]: label });
            y1 = measureLimit.min;
            y2 = measureLimit.max;
            break;
          }
          case "time-range": {
            const { related } = measureLimit;
            const axisId = axisDimension?.id;
            const timeFrom =
              related.find(
                (d) => d.type === "time-from" && d.dimensionId === axisId
              )?.label ?? "";
            const timeTo =
              related.find(
                (d) => d.type === "time-to" && d.dimensionId === axisId
              )?.label ?? "";
            x1 = getX({ [key]: timeFrom });
            x2 = getX({ [key]: timeTo });
            y1 = y2 = measureLimit.value;
            break;
          }
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          type: measureLimit.type,
          x1: xScale(x1),
          x2: xScale(x2),
          y1: yScale(y1),
          y2: yScale(y2),
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map(
        ({
          type,
          x1,
          x2,
          y1,
          y2,
          related,
          color,
          lineType,
          symbolType,
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const width =
            x1 === undefined
              ? chartWidth
              : type === "time-range"
                ? 0
                : limitWidth;

          const hasValidAxis = x1 !== undefined && x2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;

          const datum: RenderVerticalLimitDatum = {
            key,
            x1: x1 ?? 0,
            x2: x2 ?? 0,
            y1,
            y2,
            width,
            fill: color,
            lineType,
            symbolType,
          };

          return hasValidAxis || hasNoAxis ? datum : null;
        }
      )
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
