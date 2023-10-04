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
  TemporalXVariables &
  NumericalYComboLineColumnVariables;

export const useComboLineColumnStateVariables = (
  props: ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
): ComboLineColumnStateVariables => {
  const { chartConfig, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });

  const lineIri = chartConfig.fields.y.lineComponentIri;
  const lineAxisOrientation = chartConfig.fields.y.lineAxisOrientation;
  const columnIri = chartConfig.fields.y.columnComponentIri;
  let numericalYVariables: NumericalYComboLineColumnVariables;
  const lineYGetter: YGetter = {
    chartType: "line",
    orientation: lineAxisOrientation,
    dimension: dimensionsByIri[lineIri],
    iri: lineIri,
    label: getLabelWithUnit(measuresByIri[lineIri]),
    getY: (d) => {
      return d[lineIri] !== null ? Number(d[lineIri]) : null;
    },
  };
  const columnYGetter: YGetter = {
    chartType: "column",
    orientation: lineAxisOrientation === "left" ? "right" : "left",
    dimension: dimensionsByIri[columnIri],
    iri: columnIri,
    label: getLabelWithUnit(measuresByIri[columnIri]),
    getY: (d) => {
      return d[columnIri] !== null ? Number(d[columnIri]) : null;
    },
  };

  if (lineAxisOrientation === "left") {
    numericalYVariables = {
      y: {
        left: lineYGetter,
        right: columnYGetter,
      },
    };
  } else {
    numericalYVariables = {
      y: {
        left: columnYGetter,
        right: lineYGetter,
      },
    };
  }

  return {
    ...baseVariables,
    ...temporalXVariables,
    ...numericalYVariables,
  };
};

export const useComboLineColumnStateData = (
  chartProps: ChartProps<ComboLineColumnConfig> & { aspectRatio: number },
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
