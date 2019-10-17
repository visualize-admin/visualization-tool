import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import {
  getCategoricalDimensions,
  getDimensionIri,
  getTimeDimensions
} from ".";
import { useConfiguratorState } from "./configurator-state";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }
export type Option = { value: string; label: string };

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

  // FIXME: checked doesn't work for select menu on reload
  const checked =
    type === "radio" || "select"
      ? stateValue === value
      : type === "checkbox"
      ? stateValue
      : undefined;
  // console.log({ type }, { checked }, { stateValue });
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
  metaData: any;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();
  console.log({ metaData });
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      const chartType = e.currentTarget.value;
      const initialState =
        chartType === "bar"
          ? {
              x: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[1]
              }),
              height: getDimensionIri({
                dimension: metaData.measures[0]
              }),
              color: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[1]
              })
            }
          : {
              x: getDimensionIri({
                dimension: getTimeDimensions({
                  dimensions: metaData.dimensions
                })[0]
              }),
              height: getDimensionIri({
                dimension: metaData.measures[0]
              }),
              color: getDimensionIri({
                dimension: getCategoricalDimensions({
                  dimensions: metaData.dimensions
                })[1]
              })
            };
      dispatch({
        type: "CHART_TYPE_PREVIEWED",
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
