import React from "react";

import { BaseYGetter, sortData } from "@/charts/combo/combo-state-props";
import { getLabelWithUnit } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  useBandXVariables,
  useBaseVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { ComboLineColumnConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

type NumericalYComboLineColumnVariables = {
  y: {
    left: YGetter;
    right: YGetter;
  };
};

type YGetter = BaseYGetter & {
  chartType: "line" | "column";
  orientation: "left" | "right";
};

export type ComboLineColumnStateVariables = BaseVariables &
  BandXVariables &
  NumericalYComboLineColumnVariables;

export const useComboLineColumnStateVariables = (
  props: ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
): ComboLineColumnStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri, observations } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsByIri,
    observations,
  });

  const lineIri = chartConfig.fields.y.lineComponentIri;
  const lineAxisOrientation = chartConfig.fields.y.lineAxisOrientation;
  const columnIri = chartConfig.fields.y.columnComponentIri;
  let numericalYVariables: NumericalYComboLineColumnVariables;
  const lineYGetter: YGetter = {
    chartType: "line",
    orientation: lineAxisOrientation,
    dimension: measuresByIri[lineIri],
    iri: lineIri,
    label: getLabelWithUnit(measuresByIri[lineIri]),
    getY: (d) => {
      return d[lineIri] !== null ? Number(d[lineIri]) : null;
    },
  };
  const columnYGetter: YGetter = {
    chartType: "column",
    orientation: lineAxisOrientation === "left" ? "right" : "left",
    dimension: measuresByIri[columnIri],
    iri: columnIri,
    label: getLabelWithUnit(measuresByIri[columnIri]),
    getY: (d) => {
      return d[columnIri] !== null ? Number(d[columnIri]) : null;
    },
  };

  numericalYVariables =
    lineAxisOrientation === "left"
      ? {
          y: {
            left: lineYGetter,
            right: columnYGetter,
          },
        }
      : {
          y: {
            left: columnYGetter,
            right: lineYGetter,
          },
        };

  return {
    ...baseVariables,
    ...bandXVariables,
    ...numericalYVariables,
  };
};

export const useComboLineColumnStateData = (
  chartProps: ChartProps<ComboLineColumnConfig> & { aspectRatio: number },
  variables: ComboLineColumnStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getXAsDate } = variables;
  // FIXME: handle properly.
  const plottableData = observations;
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX: getXAsDate,
    });
  }, [plottableData, getXAsDate]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
