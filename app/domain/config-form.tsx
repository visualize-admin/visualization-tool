import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import { ChartType, MetaKey, FilterValueSingle } from "./config-types";
import { useConfiguratorState } from "./configurator-state";
import { DataSetMetadata } from "./data-cube";
import { Locales } from "../locales/locales";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }
export type Option = { value: string | $FixMe; label: string | $FixMe };

export type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "name" | "value" | "checked" | "type"
>;

// export const useField = ({
//   path,
//   type = "text",
//   value
// }: {
//   path: string;
//   type?: "text" | "checkbox" | "radio" | "input" | "select";
//   value?: string;
// }): FieldProps => {
//   const [state, dispatch] = useConfiguratorState();

//   const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
//     e => {
//       dispatch({
//         type: "CHART_CONFIG_CHANGED",
//         value: {
//           path,
//           value:
//             type === "checkbox"
//               ? e.currentTarget.checked
//                 ? true
//                 : undefined
//               : e.currentTarget.value
//         }
//       });
//     },
//     [dispatch, path, type]
//   );

//   const stateValue =
//     state.state === "CONFIGURING_CHART" ? get(state.chartConfig, path, "") : "";

//   const checked =
//     type === "checkbox"
//       ? stateValue
//       : type === "radio" || "select"
//       ? stateValue === value
//       : undefined;

//   return {
//     name: path,
//     value: value ? value : stateValue,
//     type,
//     checked,
//     onChange
//   };
// };

export const useControlTab = ({
  value
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback<() => void>(() => {
    dispatch({
      type: "CONTROL_TAB_CHANGED",
      value
    });
  }, [dispatch, value]);

  const stateValue =
    state.state === "CONFIGURING_CHART" ? state.activeField : "";

  const checked = stateValue === value;

  return {
    value,
    checked,
    onClick
  };
};

export const useFilterTab = ({
  value
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback<() => void>(() => {
    dispatch({
      type: "CONTROL_TAB_CHANGED",
      value
    });
  }, [dispatch, value]);

  const stateValue =
    state.state === "CONFIGURING_CHART" ? state.activeField : "";

  const checked = stateValue === value;

  return {
    value,
    checked,
    onClick
  };
};
export const useAnnotatorTab = ({
  value
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback<() => void>(() => {
    dispatch({
      type: "CHART_ANNOTATION_TAB_CHANGED",
      value
    });
  }, [dispatch, value]);

  const stateValue =
    state.state === "DESCRIBING_CHART" ? state.activeField : "";

  const checked = stateValue === value;

  return {
    value,
    checked,
    onClick
  };
};

export const useMetaField = ({
  metaKey,
  locale,
  value
}: {
  metaKey: string;
  locale: Locales;
  value?: string;
}): FieldProps => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_DESCRIPTION_CHANGED",
        value: {
          path: `${metaKey}.${locale}`,
          value: e.currentTarget.value
        }
      });
    },
    [dispatch, metaKey, locale]
  );

  return {
    name: `${metaKey}-${locale}`,
    value,
    onChange
  };
};

export const useMultiFilterField = ({
  dimensionIri,
  value
}: {
  dimensionIri: string;
  value: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_MULTI",
        value: {
          dimensionIri,
          values: { [value]: e.currentTarget.checked ? true : undefined }
        }
      });
    },
    [dispatch, dimensionIri, value]
  );

  const checked =
    state.state === "CONFIGURING_CHART"
      ? get(
          state.chartConfig,
          ["filters", dimensionIri, "values", value],
          false
        )
      : false;

  return {
    name: dimensionIri,
    value,
    checked,
    onChange
  };
};

export const useSingleFilterField = ({
  dimensionIri,
  value
}: {
  value: string;
  dimensionIri: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri,
          value: e.currentTarget.value
        }
      });
    },
    [dispatch, dimensionIri]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state.chartConfig, ["filters", dimensionIri, "value"], "")
      : "";

  const checked = stateValue === value;

  return {
    name: dimensionIri,
    value: value ? value : stateValue,
    checked,
    onChange
  };
};

export const useChartFieldField = ({
  componentIri,
  field,
  dataSetMetadata
}: {
  field: string;
  componentIri?: string;
  dataSetMetadata: DataSetMetadata;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_FIELD_CHANGED",
        value: {
          componentIri: e.currentTarget.value,
          field,
          dataSetMetadata
        }
      });
    },
    [dispatch, field, dataSetMetadata]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    const currentField: { componentIri: string } | undefined =
      state.chartConfig.fields[field];
    if (currentField) {
      value = currentField.componentIri;
    }
  }

  const checked = value === componentIri;

  return {
    name: field,
    value,
    checked,
    onChange
  };
};
export const useChartOptionField = ({
  field,
  path,
  label,
  value
}: {
  field: string;
  path: string;
  label: string;
  value: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value
        }
      });
    },
    [dispatch, field, path, value]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state, `chartConfig.fields.${field}.${path}`, "")
      : "";
  const checked = stateValue === value;

  return {
    name: path,
    value,
    checked,
    onChange
  };
};
export const useChartTypeSelectorField = ({
  path,
  value,
  metaData
}: {
  path: string;
  value?: string;
  metaData: DataSetMetadata;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e => {
      const chartType = e.currentTarget.value as ChartType;

      dispatch({
        type: "CHART_TYPE_PREVIEWED",
        value: {
          chartType,
          dataSetMetadata: metaData
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
