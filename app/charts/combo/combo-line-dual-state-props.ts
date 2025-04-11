import { min } from "d3-array";
import { useCallback } from "react";

import { BaseYGetter, sortComboData } from "@/charts/combo/combo-state-props";
import {
  getLabelWithUnit,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  shouldUseDynamicMinScaleValue,
  SortingVariables,
  TemporalXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { ComboLineDualConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

type NumericalYComboLineDualVariables = {
  y: {
    left: BaseYGetter & { orientation: "left" };
    right: BaseYGetter & { orientation: "right" };
  };
};

export type ComboLineDualStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYComboLineDualVariables &
  InteractiveFiltersVariables;

export const useComboLineDualStateVariables = (
  props: ChartProps<ComboLineDualConfig>
): ComboLineDualStateVariables => {
  const { chartConfig, dimensionsById, measuresById } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsById,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsById }
  );

  const leftId = chartConfig.fields.y.leftAxisComponentId;
  const rightId = chartConfig.fields.y.rightAxisComponentId;
  const numericalYVariables: NumericalYComboLineDualVariables = {
    y: {
      left: {
        orientation: "left",
        dimension: measuresById[leftId],
        id: leftId,
        label: getLabelWithUnit(measuresById[leftId]),
        color: fields.color.colorMapping[leftId],
        getY: (d) => (d[leftId] !== null ? Number(d[leftId]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) => (d[leftId] !== null ? Number(d[leftId]) : null)) ??
            0;

          return shouldUseDynamicMinScaleValue(measuresById[leftId].scaleType)
            ? minY
            : Math.min(0, minY);
        },
      },
      right: {
        orientation: "right",
        dimension: measuresById[rightId],
        id: rightId,
        label: getLabelWithUnit(measuresById[rightId]),
        color: fields.color.colorMapping[rightId],
        getY: (d) => (d[rightId] !== null ? Number(d[rightId]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) =>
              d[rightId] !== null ? Number(d[rightId]) : null
            ) ?? 0;

          return shouldUseDynamicMinScaleValue(measuresById[rightId].scaleType)
            ? minY
            : Math.min(0, minY);
        },
      },
    },
  };

  const { getX } = temporalXVariables;
  const sortData: ComboLineDualStateVariables["sortData"] = useCallback(
    (data) => {
      return sortComboData(data, {
        getX,
      });
    },
    [getX]
  );

  return {
    ...baseVariables,
    sortData,
    ...temporalXVariables,
    ...numericalYVariables,
    ...interactiveFiltersVariables,
  };
};

export const useComboLineDualStateData = (
  chartProps: ChartProps<ComboLineDualConfig>,
  variables: ComboLineDualStateVariables
): ChartStateData => {
  const { chartConfig, dimensions, observations } = chartProps;
  const { sortData, xDimension, getX, y, getTimeRangeDate } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
    getY: (d) => {
      for (const { getY } of [y.left, y.right]) {
        const y = getY(d);

        if (y !== null) {
          return y;
        }
      }
    },
  });

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    dimensions,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getX,
    getTimeRangeDate,
  });
};
