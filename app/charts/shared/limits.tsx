import { useEffect, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  renderContainer,
  RenderVerticalLimitDatum,
  renderVerticalLimits,
} from "@/charts/shared/rendering-utils";
import { AreaConfig, ColumnConfig, LineConfig } from "@/config-types";
import {
  getMaybeValidChartConfigLimit,
  useChartConfigFilters,
} from "@/config-utils";
import { Dimension, Measure, Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useTransitionStore } from "@/stores/transition";

export const VerticalLimits = ({
  chartConfig,
  measure,
  relatedDimension,
}: {
  chartConfig: AreaConfig | ColumnConfig | LineConfig;
  measure: Measure;
  relatedDimension: Dimension;
}) => {
  const { xScale, getX, yScale, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | LinesState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const filters = useChartConfigFilters(chartConfig);
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

    const preparedLimits = measure.limits
      .map((limit) => {
        const { limit: maybeLimit } = getMaybeValidChartConfigLimit({
          chartConfig,
          measureId: measure.id,
          limit,
          relatedDimension,
          filters,
        });

        if (!maybeLimit) {
          return;
        }

        const relatedDimensionValue = relatedDimension.values.find(
          (v) => v.value === maybeLimit.dimensionValue
        )?.label;

        if (!relatedDimensionValue) {
          return;
        }

        return {
          y1: limit.type === "single" ? limit.value : limit.from,
          y2: limit.type === "single" ? limit.value : limit.to,
          ...maybeLimit,
          relatedDimensionValue,
        };
      })
      .filter(truthy);

    return preparedLimits.map((limit) => {
      const fakeObservation: Observation = {
        [relatedDimension.id]: limit.relatedDimensionValue,
      };
      const x = getX(fakeObservation) as (Date | number) & string;

      return {
        key: limit.relatedDimensionValue,
        x: xScale(x)! + bandwidth / 2 - limitWidth / 2,
        y1: yScale(limit.y1),
        y2: yScale(limit.y2),
        width: limitWidth,
        fill: limit.color,
        lineType: limit.lineType,
      } as RenderVerticalLimitDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    measure.limits,
    measure.id,
    chartConfig,
    relatedDimension,
    filters,
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
