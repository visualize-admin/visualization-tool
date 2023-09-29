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

type NumericalYComboLineColumnVariables = {
  y: {
    axisMode: "dual";
    line: BaseYGetter & {
      orientation: "left" | "right";
    };
    column: BaseYGetter & {
      orientation: "left" | "right";
    };
  };
};

export type ComboLineColumnStateVariables = BaseVariables &
  TemporalXVariables &
  NumericalYComboLineColumnVariables;

export const useComboLineColumnStateVariables = (
  props: ChartProps<ComboConfig> & { aspectRatio: number }
): ComboLineColumnStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });

  if (chartConfig.chartSubtype !== "line-column") {
    throw new Error("This hook is only for line-column charts!");
  }

  const lineIri = chartConfig.fields.y.lineComponentIri;
  const lineAxisOrientation = chartConfig.fields.y.lineAxisOrientation;
  const columnIri = chartConfig.fields.y.columnComponentIri;
  const numericalYVariables: NumericalYComboLineColumnVariables = {
    y: {
      axisMode: "dual",
      line: {
        iri: lineIri,
        label: getLabelWithUnit(measuresByIri[lineIri]),
        orientation: lineAxisOrientation,
        getY: (d) => {
          return d[lineIri] !== null ? Number(d[lineIri]) : null;
        },
      },
      column: {
        iri: columnIri,
        label: getLabelWithUnit(measuresByIri[columnIri]),
        orientation: lineAxisOrientation === "left" ? "right" : "left",
        getY: (d) => {
          return d[columnIri] !== null ? Number(d[columnIri]) : null;
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

export const useComboLineColumnStateData = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineColumnStateVariables
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
