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
import { ComboConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

type NumericalYComboLineVariables = {
  y:
    | {
        axisMode: "single";
        lines: BaseYGetter[];
      }
    | {
        axisMode: "dual";
        lineLeft: BaseYGetter;
        lineRight: BaseYGetter;
      };
};

export type ComboLineStateVariables = BaseVariables &
  TemporalXVariables &
  NumericalYComboLineVariables;

export const useComboLineStateVariables = (
  props: ChartProps<ComboConfig> & { aspectRatio: number }
): ComboLineStateVariables => {
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

  let numericalYVariables: NumericalYComboLineVariables;
  switch (chartConfig.fields.y.axisMode) {
    case "single": {
      numericalYVariables = {
        y: {
          axisMode: "single",
          lines: chartConfig.fields.y.componentIris.map((iri) => ({
            iri,
            label: getLabelWithUnit(measuresByIri[iri]),
            getY: (d) => {
              return d[iri] !== null ? Number(d[iri]) : null;
            },
          })),
        },
      };
      break;
    }
    case "dual":
      const leftIri = chartConfig.fields.y.leftAxisComponentIri;
      const rightIri = chartConfig.fields.y.rightAxisComponentIri;
      numericalYVariables = {
        y: {
          axisMode: "dual",
          lineLeft: {
            iri: leftIri,
            label: getLabelWithUnit(measuresByIri[leftIri]),
            getY: (d) => {
              return d[leftIri] !== null ? Number(d[leftIri]) : null;
            },
          },
          lineRight: {
            iri: rightIri,
            label: getLabelWithUnit(measuresByIri[rightIri]),
            getY: (d) => {
              return d[rightIri] !== null ? Number(d[rightIri]) : null;
            },
          },
        },
      };
      break;
    default:
      const _exhaustiveCheck: never = chartConfig.fields.y;
      return _exhaustiveCheck;
  }

  return {
    ...baseVariables,
    ...temporalXVariables,
    ...numericalYVariables,
  };
};

export const useComboLineStateData = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineStateVariables
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
