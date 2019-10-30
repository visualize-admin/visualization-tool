import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import {
  getCategoricalDimensions,
  getDimensionIri,
  getTimeDimensions,
  getInitialFilters,
  getInitialState
} from ".";
import { useConfiguratorState } from "./configurator-state";
import { DataSetMetadata, isTimeDimension } from "./data-cube";
import { ChartType } from "./config-types";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }
export type Option = { value: string | any; label: string | any };

export type FieldProps = Pick<
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
  type?: "text" | "checkbox" | "radio" | "input" | "select";
  value?: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

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
    type === "checkbox"
      ? stateValue
      : type === "radio" || "select"
      ? stateValue === value
      : undefined;

  return {
    name: path,
    value: value ? value : stateValue,
    type,
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
  metaData: DataSetMetadata;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();
  const { dimensions, measures } = metaData;
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      const chartType = e.currentTarget.value as ChartType;
      const filters = getInitialFilters(dimensions);
      const initialState = getInitialState({ chartType, dimensions, measures });
      dispatch({
        type: "CHART_TYPE_PREVIEWED",
        value: {
          path: "chartConfig",
          value: {
            chartType,
            filters,
            ...initialState
          }
        }
      });
    },
    [dimensions, dispatch, measures]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART" ||
    state.state === "SELECTING_CHART_TYPE"
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
