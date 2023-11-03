import React from "react";

import { BaseYGetter, sortData } from "@/charts/combo/combo-state-props";
import {
  getLabelWithUnit,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
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
    left: BaseYGetter & { orientation: "left" };
    right: BaseYGetter & { orientation: "right" };
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
      left: {
        orientation: "left",
        dimension: measuresByIri[leftIri],
        iri: leftIri,
        label: getLabelWithUnit(measuresByIri[leftIri]),
        color: fields.y.colorMapping[leftIri],
        getY: (d) => {
          return d[leftIri] !== null ? Number(d[leftIri]) : null;
        },
      },
      right: {
        orientation: "right",
        dimension: measuresByIri[rightIri],
        iri: rightIri,
        label: getLabelWithUnit(measuresByIri[rightIri]),
        color: fields.y.colorMapping[rightIri],
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
  const { getX, y } = variables;
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
