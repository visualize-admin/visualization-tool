import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import {
  getCategoricalDimensions,
  getDimensionIri,
  getTimeDimensions,
  getInitialFilters
} from ".";
import { useConfiguratorState } from "./configurator-state";
import { DataSetMetadata, isTimeDimension } from "./data-cube";

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
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      const chartType = e.currentTarget.value;
      const nonTimeDImensions = metaData.dimensions.filter(
        dimension => !isTimeDimension(dimension)
      );
      const initialFilters = getInitialFilters(metaData.dimensions);
      const initialState =
        chartType === "scatterplot"
          ? {
              x: getDimensionIri(metaData.measures[0]),
              y: getDimensionIri(
                metaData.measures.length > 1
                  ? metaData.measures[1]
                  : metaData.measures[0]
              ),
              color: getDimensionIri(
                getCategoricalDimensions(metaData.dimensions)[0]
              ),
              label: getDimensionIri(getTimeDimensions(metaData.dimensions)[0]),
              palette: "category10"
            }
          : chartType === "column"
          ? {
              x: getDimensionIri(nonTimeDImensions[0]),
              height: getDimensionIri(metaData.measures[0]),
              color: getDimensionIri(
                getCategoricalDimensions(metaData.dimensions)[0]
              ),
              palette: "category10"
            }
          : {
              x: getDimensionIri(getTimeDimensions(metaData.dimensions)[0]),
              height: getDimensionIri(metaData.measures[0]),
              color: getDimensionIri(
                getCategoricalDimensions(metaData.dimensions)[1]
              ),
              palette: "category10"
            };
      dispatch({
        type: "CHART_TYPE_PREVIEWED",
        value: {
          path: "chartConfig",
          value: {
            chartType,
            filters: initialFilters,
            ...initialState
          }
        }
      });
    },
    [dispatch, metaData]
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
