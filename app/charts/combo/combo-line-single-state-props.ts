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
import { ComboConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

type NumericalYComboLineSingleVariables = {
  y: {
    lines: BaseYGetter[];
  };
};

export type ComboLineSingleStateVariables = BaseVariables &
  TemporalXVariables &
  NumericalYComboLineSingleVariables;

export const useComboLineSingleStateVariables = (
  props: ChartProps<ComboConfig> & { aspectRatio: number }
): ComboLineSingleStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });

  if (chartConfig.chartSubtype !== "line") {
    throw new Error("This hook is only for line charts!");
  }

  if (chartConfig.fields.y.axisMode !== "single") {
    throw new Error("This hook is only for single axis line charts!");
  }

  const numericalYVariables: NumericalYComboLineSingleVariables = {
    y: {
      lines: chartConfig.fields.y.componentIris.map((iri) => ({
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
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineSingleStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  // FIXME: handle properly.
  const plottableData = observations;
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX: variables.getX,
    });
  }, [plottableData, variables.getX]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate: variables.getX,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
