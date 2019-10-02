import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import {
  getCategoricalDimensions,
  getDimensionIri,
  getMeasuresDimensions,
  getTimeDimensions
} from ".";
import { useConfiguratorState } from "./configurator-state";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }

type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "name" | "value" | "checked" | "type"
>;

export const useField = ({
  chartId,
  path,
  type = "text",
  value
}: {
  chartId: string;
  path: string;
  type?: "text" | "checkbox" | "radio";
  value?: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_CONFIG_CHANGED",
        value: {
          path,
          value:
            type === "checkbox"
              ? e.currentTarget.checked
                ? true
                : undefined
              : e.currentTarget.value
        }
      });
    },
    [dispatch, path, type]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART" ? get(state.chartConfig, path, "") : "";

  const checked =
    type === "radio"
      ? stateValue === value
      : type === "checkbox"
      ? stateValue
      : undefined;

  return {
    name: path,
    value: value ? value : stateValue,
    type,
    checked,
    onChange
  };
};

export const useDatasetSelectorField = ({
  chartId,
  path,
  value,
  type = "radio"
}: {
  chartId: string;
  path: string;
  value?: string;
  type: "radio";
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "DATASET_SELECTED",
        value: e.currentTarget.value
      });
    },
    [dispatch]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART" ? get(state, path, "") : "";

  const checked = stateValue === value;

  return {
    name: path,
    value: value ? value : stateValue,
    checked,
    onChange
  };
};

export const useChartTypeSelectorField = ({
  chartId,
  path,
  value,
  type = "radio",
  metaData
}: {
  chartId: string;
  path: string;
  value?: string;
  type: "radio";
  metaData: any;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState({ chartId });

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      const chartType = e.currentTarget.value;
      const initialState =
        chartType === "bar"
          ? {
              x: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[0]
              }),
              height: getDimensionIri({
                dimension: getMeasuresDimensions({
                  dimensions: metaData.dimensions
                })[0]
              }),
              color: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[0]
              })
            }
          : {
              x: getDimensionIri({
                dimension: getTimeDimensions({
                  dimensions: metaData.dimensions
                })[0]
              }),
              height: getDimensionIri({
                dimension: getMeasuresDimensions({
                  dimensions: metaData.dimensions
                })[0]
              }),
              color: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[0]
              })
            };
      dispatch({
        type: "CHART_TYPE_CHANGED",
        value: {
          path: "chartConfig",
          value: {
            chartType,
            filters: {},
            ...initialState
          }
        }
      });
    },
    [dispatch, metaData]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state, "chartConfig.chartType")
      : "";

  const checked = stateValue === value;

  return {
    name: path,
    value: value ? value : stateValue,
    checked,
    onChange
  };
};
