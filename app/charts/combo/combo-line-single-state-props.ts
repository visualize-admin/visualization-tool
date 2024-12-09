import { min } from "d3-array";
import { useCallback, useMemo } from "react";

import { BaseYGetter, sortComboData } from "@/charts/combo/combo-state-props";
import {
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  SortingVariables,
  TemporalXVariables,
  shouldUseDynamicMinScaleValue,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { ComboLineSingleConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";
import { usePlottableData } from "../shared/chart-helpers";

type NumericalYComboLineSingleVariables = {
  y: {
    lines: BaseYGetter[];
  };
};

export type ComboLineSingleStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYComboLineSingleVariables &
  InteractiveFiltersVariables;

export const useComboLineSingleStateVariables = (
  props: ChartProps<ComboLineSingleConfig>
): ComboLineSingleStateVariables => {
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

  const numericalYVariables: NumericalYComboLineSingleVariables = {
    y: {
      lines: chartConfig.fields.y.componentIds.map((id) => ({
        dimension: measuresById[id],
        id,
        label: measuresById[id].label,
        color: fields.y.colorMapping[id],
        getY: (d) => (d[id] !== null ? Number(d[id]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) => (d[id] !== null ? Number(d[id]) : null)) ?? 0;

          return shouldUseDynamicMinScaleValue(measuresById[id].scaleType)
            ? minY
            : Math.min(0, minY);
        },
      })),
    },
  };

  const { getX } = temporalXVariables;
  const sortData: ComboLineSingleStateVariables["sortData"] = useCallback(
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

export const useComboLineSingleStateData = (
  chartProps: ChartProps<ComboLineSingleConfig>,
  variables: ComboLineSingleStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { sortData, xDimension, getX, y, getTimeRangeDate } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
    getY: (d) => {
      for (const { getY } of y.lines) {
        const y = getY(d);

        if (y !== null) {
          return y;
        }
      }
    },
  });
  const sortedPlottableData = useMemo(() => {
    return sortData(plottableData);
  }, [sortData, plottableData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    timeRangeDimensionId: xDimension.id,
    getXAsDate: getX,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
