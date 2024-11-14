import { min } from "d3-array";
import { useCallback, useMemo } from "react";

import { BaseYGetter, sortComboData } from "@/charts/combo/combo-state-props";
import {
  getLabelWithUnit,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
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

  const leftIri = chartConfig.fields.y.leftAxisComponentIri;
  const rightIri = chartConfig.fields.y.rightAxisComponentIri;
  const numericalYVariables: NumericalYComboLineDualVariables = {
    y: {
      left: {
        orientation: "left",
        dimension: measuresById[leftIri],
        iri: leftIri,
        label: getLabelWithUnit(measuresById[leftIri]),
        color: fields.y.colorMapping[leftIri],
        getY: (d) => (d[leftIri] !== null ? Number(d[leftIri]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) =>
              d[leftIri] !== null ? Number(d[leftIri]) : null
            ) ?? 0;
          return shouldUseDynamicMinScaleValue(measuresById[leftIri].scaleType)
            ? minY
            : Math.min(0, minY);
        },
      },
      right: {
        orientation: "right",
        dimension: measuresById[rightIri],
        iri: rightIri,
        label: getLabelWithUnit(measuresById[rightIri]),
        color: fields.y.colorMapping[rightIri],
        getY: (d) => (d[rightIri] !== null ? Number(d[rightIri]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) =>
              d[rightIri] !== null ? Number(d[rightIri]) : null
            ) ?? 0;
          return shouldUseDynamicMinScaleValue(measuresById[rightIri].scaleType)
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
  const { chartConfig, observations } = chartProps;
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
