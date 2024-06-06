import { min } from "d3-array";
import { useCallback, useMemo } from "react";

import { BaseYGetter, sortComboData } from "@/charts/combo/combo-state-props";
import {
  getLabelWithUnit,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  RenderingVariables,
  SortingVariables,
  shouldUseDynamicMinScaleValue,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ComboLineColumnConfig, useChartConfigFilters } from "@/configurator";

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
  SortingVariables &
  BandXVariables &
  NumericalYComboLineColumnVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useComboLineColumnStateVariables = (
  props: ChartProps<ComboLineColumnConfig>
): ComboLineColumnStateVariables => {
  const {
    chartConfig,
    dimensions,
    dimensionsByIri,
    measuresByIri,
    observations,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x } = fields;
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsByIri,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsByIri }
  );

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
    color: fields.y.colorMapping[lineIri],
    getY: (d) => (d[lineIri] !== null ? Number(d[lineIri]) : null),
    getMinY: (data) => {
      const minY =
        min(data, (d) => (d[lineIri] !== null ? Number(d[lineIri]) : null)) ??
        0;
      return shouldUseDynamicMinScaleValue(measuresByIri[lineIri].scaleType)
        ? minY
        : Math.min(0, minY);
    },
  };
  const columnYGetter: YGetter = {
    chartType: "column",
    orientation: lineAxisOrientation === "left" ? "right" : "left",
    dimension: measuresByIri[columnIri],
    iri: columnIri,
    label: getLabelWithUnit(measuresByIri[columnIri]),
    color: fields.y.colorMapping[columnIri],
    getY: (d) => (d[columnIri] !== null ? Number(d[columnIri]) : null),
    getMinY: (data) => {
      const minY =
        min(data, (d) =>
          d[columnIri] !== null ? Number(d[columnIri]) : null
        ) ?? 0;
      return Math.min(0, minY);
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

  const { getXAsDate } = bandXVariables;
  const sortData: ComboLineColumnStateVariables["sortData"] = useCallback(
    (data) => {
      return sortComboData(data, {
        getX: getXAsDate,
      });
    },
    [getXAsDate]
  );

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    undefined
  );

  return {
    ...baseVariables,
    sortData,
    ...bandXVariables,
    ...numericalYVariables,
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export const useComboLineColumnStateData = (
  chartProps: ChartProps<ComboLineColumnConfig>,
  variables: ComboLineColumnStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { sortData, getX, getXAsDate, y, getTimeRangeDate } = variables;
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
    getXAsDate,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
