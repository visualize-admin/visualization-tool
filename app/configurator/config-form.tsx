import get from "lodash/get";
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { SelectProps } from "theme-ui";
import { getFieldComponentIri } from "../charts";
import { DimensionValuesQuery } from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { ChartConfig, ChartType } from "./config-types";
import { getFilterValue, useConfiguratorState } from "./configurator-state";
import { FIELD_VALUE_NONE } from "./constants";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }
export type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  isNoneValue?: boolean;
  disabled?: boolean;
};

export type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

// Generic ------------------------------------------------------------------

export const useChartFieldField = ({
  field,
  dataSetMetadata,
}: {
  field: string;
  dataSetMetadata: DataCubeMetadata;
}): SelectProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLSelectElement>) => void>(
    (e) =>
      e.currentTarget.value !== FIELD_VALUE_NONE
        ? dispatch({
            type: "CHART_FIELD_CHANGED",
            value: {
              field,
              dataSetMetadata,
              componentIri: e.currentTarget.value,
            },
          })
        : dispatch({
            type: "CHART_FIELD_DELETED",
            value: {
              field,
              dataSetMetadata,
            },
          }),
    [dispatch, field, dataSetMetadata]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value =
      getFieldComponentIri(state.chartConfig.fields, field) ?? FIELD_VALUE_NONE;
  }

  return {
    name: field,
    value,
    onChange,
  };
};

export const useChartOptionSelectField = <ValueType extends {} = string>({
  field,
  path,
  getValue,
  getKey,
}: {
  field: string;
  path: string;
  getValue?: (key: string) => ValueType | undefined;
  getKey?: (value: ValueType) => string;
}): SelectProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLSelectElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value: getValue
            ? getValue(e.currentTarget.value)
            : e.currentTarget.value,
        },
      });
    },
    [dispatch, field, path, getValue]
  );

  let value: ValueType | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value = get(state, `chartConfig.fields["${field}"].${path}`);
  }
  return {
    name: path,
    value: getKey ? getKey(value!) : (value as unknown as string),
    // checked,
    onChange,
  };
};

export const useDimensionSelection = (dimensionIri: string) => {
  const [state, dispatch] = useConfiguratorState();

  const selectAll = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_RESET_MULTI",
      value: {
        dimensionIri,
      },
    });
  }, [dispatch, dimensionIri]);

  const selectNone = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI",
      value: { dimensionIri },
    });
  }, [dispatch, dimensionIri]);

  return useMemo(() => ({ selectAll, selectNone }), [selectAll, selectNone]);
};

export const useChartOptionRadioField = ({
  field,
  path,
  value,
}: {
  field: string;
  path: string;
  value: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value,
        },
      });
    },
    [dispatch, field, path, value]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state, `chartConfig.fields["${field}"].${path}`, "")
      : "";
  const checked = stateValue ? stateValue === value : undefined;

  return {
    name: path,
    value,
    checked,
    onChange,
  };
};

export const useChartOptionBooleanField = ({
  path,
  field,
}: {
  path: string;
  field: string | null;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          path,
          field,
          value: e.currentTarget.checked,
        },
      });
    },
    [dispatch, path, field]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(
          state,
          field === null
            ? `chartConfig.${path}`
            : `chartConfig.fields["${field}"].${path}`,
          ""
        )
      : "";
  const checked = stateValue ? stateValue : false;

  return {
    name: path,
    checked,
    onChange,
  };
};

export const useActiveFieldField = ({
  value,
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;

  return {
    value,
    checked,
    onClick,
  };
};

// Specific ------------------------------------------------------------------
export const useChartTypeSelectorField = ({
  value,
  metaData,
}: {
  value: string;
  metaData: DataCubeMetadata;
}): FieldProps & {
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => void;
} => {
  const [state, dispatch] = useConfiguratorState();
  const onClick = useCallback<(e: SyntheticEvent<HTMLButtonElement>) => void>(
    (e) => {
      const chartType = e.currentTarget.value as ChartType;

      dispatch({
        type: "CHART_TYPE_CHANGED",
        value: {
          chartType,
          dataSetMetadata: metaData,
        },
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
    name: "chartType",
    value, // ? value : stateValue,
    checked,
    onClick,
  };
};

// Used in the configurator filters
export const useSingleFilterSelect = ({
  dimensionIri,
}: {
  dimensionIri: string;
}): {
  value: string | undefined;
  onChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<
    (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void
  >(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri,
          value:
            e.currentTarget.value === ""
              ? FIELD_VALUE_NONE
              : e.currentTarget.value,
        },
      });
    },
    [dimensionIri, dispatch]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value = get(
      state.chartConfig,
      ["filters", dimensionIri, "value"],
      FIELD_VALUE_NONE
    );
  }
  return {
    value,
    onChange,
  };
};

// Used in the Table Chart options
export const useSingleFilterField = ({
  dimensionIri,
  value,
}: {
  value: string;
  dimensionIri: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri,
          value: e.currentTarget.value,
        },
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
    onChange,
  };
};

export const isMultiFilterFieldChecked = (
  chartConfig: ChartConfig,
  dimensionIri: string,
  value: string
) => {
  const filter = chartConfig.filters[dimensionIri];
  const fieldChecked =
    filter?.type === "multi" ? filter.values?.[value] ?? false : false;
  return fieldChecked;
};

type CheckActionType = "SET" | "ADD";

export type MultiFilterSelectionState =
  | "SOME_SELECTED"
  | "NONE_SELECTED"
  | "ALL_SELECTED";

const MultiFilterContext = React.createContext({
  isFilterActive: new Set() as Set<string>,
  checkAction: "SET" as CheckActionType, // TODO fix, use imported type
  allValues: [] as string[],
  selectionState: "NONE_SELECTED" as MultiFilterSelectionState,
});

export const useMultiFilterContext = () => {
  return useContext(MultiFilterContext);
};

export const MultiFilterContextProvider = ({
  dimensionData,
  children,
}: {
  dimensionData: NonNullable<
    DimensionValuesQuery["dataCubeByIri"]
  >["dimensionByIri"];
  children: React.ReactNode;
}) => {
  const [state] = useConfiguratorState();

  const activeFilter = dimensionData
    ? getFilterValue(state, dimensionData.iri)
    : null;

  const isFilterActive: Set<string> = useMemo(() => {
    if (!dimensionData) {
      return new Set();
    }
    const activeKeys = activeFilter
      ? activeFilter.type === "single"
        ? [String(activeFilter.value)]
        : activeFilter.type === "multi"
        ? Object.keys(activeFilter.values)
        : []
      : [];
    return new Set(activeKeys);
  }, [dimensionData, activeFilter]);

  const selectionState: MultiFilterSelectionState = !activeFilter
    ? "ALL_SELECTED"
    : isFilterActive.size === 0
    ? "NONE_SELECTED"
    : "SOME_SELECTED";

  const checkAction =
    selectionState === "NONE_SELECTED" ? "SET" : ("ADD" as CheckActionType);

  const allValues = useMemo(() => {
    return dimensionData?.values.map((d) => d.value) ?? [];
  }, [dimensionData?.values]);

  const ctx = useMemo(
    () => ({
      checkAction,
      allValues,
      isFilterActive,
      selectionState,
    }),
    [checkAction, allValues, isFilterActive, selectionState]
  );

  return (
    <MultiFilterContext.Provider value={ctx}>
      {children}
    </MultiFilterContext.Provider>
  );
};

export const useMultiFilterCheckboxes = (
  dimensionIri: string,
  value: string,
  onChangeProp?: () => void
) => {
  const [state, dispatch] = useConfiguratorState();
  const { checkAction, allValues, isFilterActive, selectionState } =
    useMultiFilterContext();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.checked) {
        dispatch({
          type:
            checkAction === "ADD"
              ? "CHART_CONFIG_FILTER_ADD_MULTI"
              : "CHART_CONFIG_FILTER_SET_MULTI",
          value: {
            dimensionIri,
            value,
            allValues,
          },
        });
      } else {
        dispatch({
          type: "CHART_CONFIG_FILTER_REMOVE_MULTI",
          value: {
            dimensionIri,
            value,
            allValues,
          },
        });
      }
      onChangeProp?.();
    },
    [dispatch, dimensionIri, allValues, value, onChangeProp, checkAction]
  );

  const checkedState =
    state.state === "CONFIGURING_CHART"
      ? isMultiFilterFieldChecked(state.chartConfig, dimensionIri, value)
      : false;

  return {
    onChange,
    checked:
      selectionState === "ALL_SELECTED"
        ? true
        : selectionState === "SOME_SELECTED"
        ? !!isFilterActive.has(value)
        : undefined && checkedState,
  };
};

export const useMetaField = ({
  metaKey,
  locale,
  value,
}: {
  metaKey: string;
  locale: string;
  value?: string;
}): FieldProps => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_DESCRIPTION_CHANGED",
        value: {
          path: `${metaKey}.${locale}`,
          value: e.currentTarget.value,
        },
      });
    },
    [dispatch, metaKey, locale]
  );

  return {
    name: `${metaKey}-${locale}`,
    value,
    onChange,
  };
};
