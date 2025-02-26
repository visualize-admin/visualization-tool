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
  relatedDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { yScale, getY, xScale, bounds } = useChartState() as BarsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderHorizontalLimitDatum[] = useMemo(() => {
    const bandwidth = yScale.bandwidth();
    const limitHeight = Math.min(yScale.bandwidth(), 15);
    const preparedLimits = limits
      .map(({ configLimit, measureLimit }) => {
        const relatedDimensionValue = relatedDimension?.values.find(
          (v) => v.value === configLimit.dimensionValue
        )?.label;

        if (!relatedDimensionValue) {
          return;
        }

        return {
          y1:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.from,
          y2:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.to,
          ...configLimit,
          relatedDimensionValue,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map((limit) => {
        const fakeObservation: Observation = {
          [relatedDimension?.id ?? ""]: limit.relatedDimensionValue,
        };
        const y = getY(fakeObservation);
        const yScaled = yScale(y);

        return yScaled !== undefined
          ? ({
              key: limit.relatedDimensionValue,
              y: yScaled + bandwidth / 2 - limitHeight / 2,
              x1: xScale(limit.y1),
              x2: xScale(limit.y2),
              height: limitHeight,
              fill: limit.color,
              lineType: limit.lineType,
            } as RenderHorizontalLimitDatum)
          : null;
      })
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    relatedDimension?.values,
    relatedDimension?.id,
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
  relatedDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { xScale, getX, yScale, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | LinesState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderVerticalLimitDatum[] = useMemo(() => {
    const { bandwidth, limitWidth } =
      "bandwidth" in xScale
        ? {
            bandwidth: xScale.bandwidth(),
            limitWidth: Math.min(xScale.bandwidth(), 15),
          }
        : {
            bandwidth: 0,
            limitWidth: 15,
          };

    const preparedLimits = limits
      .map(({ configLimit, measureLimit }) => {
        const relatedDimensionValue = relatedDimension?.values.find(
          (v) => v.value === configLimit.dimensionValue
        )?.label;

        if (!relatedDimensionValue) {
          return;
        }

        return {
          y1:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.from,
          y2:
            measureLimit.type === "single"
              ? measureLimit.value
              : measureLimit.to,
          ...configLimit,
          relatedDimensionValue,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map((limit) => {
        const fakeObservation: Observation = {
          [relatedDimension?.id ?? ""]: limit.relatedDimensionValue,
        };
        const x = getX(fakeObservation) as $IntentionalAny;
        const xScaled = xScale(x);

        return xScaled !== undefined
          ? ({
              key: limit.relatedDimensionValue,
              x: xScaled + bandwidth / 2 - limitWidth / 2,
              y1: yScale(limit.y1),
              y2: yScale(limit.y2),
              width: limitWidth,
              fill: limit.color,
              lineType: limit.lineType,
            } as RenderVerticalLimitDatum)
          : null;
      })
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    relatedDimension?.values,
    relatedDimension?.id,
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
