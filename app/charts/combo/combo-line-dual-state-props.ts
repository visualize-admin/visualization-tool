import React from "react";

import { BaseYGetter, sortData } from "@/charts/combo/combo-state-props";
import { getLabelWithUnit } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  TemporalXVariables,
  useBaseVariables,
  useChartData,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { ComboLineDualConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

type NumericalYComboLineDualVariables = {
  y: {
    lineLeft: BaseYGetter & { orientation: "left" };
    lineRight: BaseYGetter & { orientation: "right" };
  };
};

export type ComboLineDualStateVariables = BaseVariables &
  TemporalXVariables &
  NumericalYComboLineDualVariables;

export const useComboLineDualStateVariables = (
  props: ChartProps<ComboLineDualConfig> & { aspectRatio: number }
): ComboLineDualStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });

  const leftIri = chartConfig.fields.y.leftAxisComponentIri;
  const rightIri = chartConfig.fields.y.rightAxisComponentIri;
  const numericalYVariables: NumericalYComboLineDualVariables = {
    y: {
      lineLeft: {
        orientation: "left",
        dimension: dimensionsByIri[rightIri],
        iri: leftIri,
        label: getLabelWithUnit(measuresByIri[leftIri]),
        getY: (d) => {
          return d[leftIri] !== null ? Number(d[leftIri]) : null;
        },
      },
      lineRight: {
        orientation: "right",
        dimension: dimensionsByIri[rightIri],
        iri: rightIri,
        label: getLabelWithUnit(measuresByIri[rightIri]),
        getY: (d) => {
          return d[rightIri] !== null ? Number(d[rightIri]) : null;
        },
      },
    },
  };

  return {
    ...baseVariables,
    ...temporalXVariables,
    ...numericalYVariables,
  };
};

export const useComboLineDualStateData = (
  chartProps: ChartProps<ComboLineDualConfig> & { aspectRatio: number },
  variables: ComboLineDualStateVariables
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
