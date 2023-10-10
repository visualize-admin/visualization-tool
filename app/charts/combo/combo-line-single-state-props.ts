import React from "react";

import { BaseYGetter, sortData } from "@/charts/combo/combo-state-props";
import {
  BaseVariables,
  ChartStateData,
  TemporalXVariables,
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
  TemporalXVariables &
  NumericalYComboLineSingleVariables;

export const useComboLineSingleStateVariables = (
  props: ChartProps<ComboLineSingleConfig> & { aspectRatio: number }
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
        getY: (d) => {
          return d[iri] !== null ? Number(d[iri]) : null;
        },
      })),
    },
  };

  return {
    ...baseVariables,
    ...temporalXVariables,
    ...numericalYVariables,
  };
};

export const useComboLineSingleStateData = (
  chartProps: ChartProps<ComboLineSingleConfig> & { aspectRatio: number },
  variables: ComboLineSingleStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, y } = variables;
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
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX,
    });
  }, [plottableData, getX]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate: getX,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
