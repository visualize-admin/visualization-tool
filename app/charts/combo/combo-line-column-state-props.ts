import { min } from "d3-array";
import { useCallback } from "react";

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
  shouldUseDynamicMinScaleValue,
  SortingVariables,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters } from "@/config-utils";
import { ComboLineColumnConfig } from "@/configurator";

import { ChartProps } from "../shared/chart-props";

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
    dimensionsById,
    measuresById,
    observations,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x } = fields;

  const filters = useChartConfigFilters(chartConfig);
  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsById,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsById }
  );

  const lineId = chartConfig.fields.y.lineComponentId;
  const lineAxisOrientation = chartConfig.fields.y.lineAxisOrientation;
  const columnId = chartConfig.fields.y.columnComponentId;
  let numericalYVariables: NumericalYComboLineColumnVariables;
  const lineYGetter: YGetter = {
    chartType: "line",
    orientation: lineAxisOrientation,
    dimension: measuresById[lineId],
    id: lineId,
    label: getLabelWithUnit(measuresById[lineId]),
    color: fields.color.colorMapping[lineId],
    getY: (d) => (d[lineId] !== null ? Number(d[lineId]) : null),
    getMinY: (data) => {
      const minY =
        min(data, (d) => (d[lineId] !== null ? Number(d[lineId]) : null)) ?? 0;

      return shouldUseDynamicMinScaleValue(measuresById[lineId].scaleType)
        ? minY
        : Math.min(0, minY);
    },
  };
  const columnYGetter: YGetter = {
    chartType: "column",
    orientation: lineAxisOrientation === "left" ? "right" : "left",
    dimension: measuresById[columnId],
    id: columnId,
    label: getLabelWithUnit(measuresById[columnId]),
    color: fields.color.colorMapping[columnId],
    getY: (d) => (d[columnId] !== null ? Number(d[columnId]) : null),
    getMinY: (data) => {
      const minY =
        min(data, (d) => (d[columnId] !== null ? Number(d[columnId]) : null)) ??
        0;
      0;

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
  const { sortData, xDimension, getX, getXAsDate, y, getTimeRangeDate } =
    variables;
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

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getXAsDate,
    getTimeRangeDate,
  });
};
