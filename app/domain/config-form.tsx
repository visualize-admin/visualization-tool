import get from "lodash/get";
import { InputHTMLAttributes, useCallback, ChangeEvent } from "react";
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

  const stateValue = state.state === "IN_PROGRESS" ? get(state, path, "") : "";

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
