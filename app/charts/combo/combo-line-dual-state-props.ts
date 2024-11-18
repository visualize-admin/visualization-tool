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
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsByIri }
  );

  const leftIri = chartConfig.fields.y.leftAxisComponentIri;
  const rightIri = chartConfig.fields.y.rightAxisComponentIri;
  const numericalYVariables: NumericalYComboLineDualVariables = {
    y: {
      left: {
        orientation: "left",
        dimension: measuresByIri[leftIri],
        iri: leftIri,
        label: getLabelWithUnit(measuresByIri[leftIri]),
        color: fields.y.colorMapping[leftIri],
        getY: (d) => (d[leftIri] !== null ? Number(d[leftIri]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) =>
              d[leftIri] !== null ? Number(d[leftIri]) : null
            ) ?? 0;
          return shouldUseDynamicMinScaleValue(measuresByIri[leftIri].scaleType)
            ? minY
            : Math.min(0, minY);
        },
      },
      right: {
        orientation: "right",
        dimension: measuresByIri[rightIri],
        iri: rightIri,
        label: getLabelWithUnit(measuresByIri[rightIri]),
        color: fields.y.colorMapping[rightIri],
        getY: (d) => (d[rightIri] !== null ? Number(d[rightIri]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) =>
              d[rightIri] !== null ? Number(d[rightIri]) : null
            ) ?? 0;
          return shouldUseDynamicMinScaleValue(
            measuresByIri[rightIri].scaleType
          )
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
    timeRangeDimensionIri: xDimension.iri,
    getXAsDate: getX,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
