import { min } from "d3-array";
import { useCallback, useMemo } from "react";

import { BaseYGetter, sortComboData } from "@/charts/combo/combo-state-props";
import {
  BaseVariables,
  ChartStateData,
  SortingVariables,
  TemporalXVariables,
  shouldUseDynamicMinScaleValue,
  useBaseVariables,
  useChartData,
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
  NumericalYComboLineSingleVariables;

export const useComboLineSingleStateVariables = (
  props: ChartProps<ComboLineSingleConfig>
): ComboLineSingleStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });

  const numericalYVariables: NumericalYComboLineSingleVariables = {
    y: {
      lines: chartConfig.fields.y.componentIris.map((iri) => ({
        dimension: measuresByIri[iri],
        iri,
        label: measuresByIri[iri].label,
        color: fields.y.colorMapping[iri],
        getY: (d) => (d[iri] !== null ? Number(d[iri]) : null),
        getMinY: (data) => {
          const minY =
            min(data, (d) => (d[iri] !== null ? Number(d[iri]) : null)) ?? 0;
          return shouldUseDynamicMinScaleValue(measuresByIri[iri].scaleType)
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
  };
};

export const useComboLineSingleStateData = (
  chartProps: ChartProps<ComboLineSingleConfig>,
  variables: ComboLineSingleStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { sortData, getX, y } = variables;
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
    getXAsDate: getX,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
