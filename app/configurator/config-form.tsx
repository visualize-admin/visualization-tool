import { SelectChangeEvent, SelectProps } from "@mui/material";
import get from "lodash/get";
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClient } from "urql";

import { getFieldComponentIri, getInitialConfig } from "@/charts";
import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ChartType,
  getChartConfig,
  isComboChartConfig,
} from "@/config-types";
import {
  getChartOptionField,
  getFilterValue,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  DimensionHierarchyDocument,
  DimensionHierarchyQuery,
  DimensionHierarchyQueryVariables,
  DimensionValuesQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { DataCubeMetadataWithHierarchies } from "@/graphql/types";
import { useLocale } from "@/locales/use-locale";
import { bfs } from "@/utils/bfs";
import { isMultiHierarchyNode } from "@/utils/hierarchy";
import useEvent from "@/utils/use-event";

export type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  position?: number;
  isNoneValue?: boolean;
  disabled?: boolean;
};

export type OptionGroup = $FixMe;

export type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

const getLeaves = (
  tree: HierarchyValue[],
  {
    limit,
    ignoreNode,
  }: {
    limit?: number;
    ignoreNode: (hv: HierarchyValue) => boolean;
  }
) => {
  const leaves = tree ? ([] as HierarchyValue[]) : undefined;
  if (tree && leaves) {
    bfs(tree, (node) => {
      if (ignoreNode && ignoreNode(node)) {
        return bfs.IGNORE;
      }
      if (
        (!node.children || node.children.length === 0) &&
        node.hasValue &&
        (limit === undefined || leaves.length < limit)
      ) {
        leaves?.push(node);
      }
    });
  }
  return leaves;
};

// Generic ------------------------------------------------------------------

export const useChartFieldField = ({
  field,
}: {
  field: EncodingFieldType;
}): SelectProps & {
  fetching: boolean;
} => {
  const unmountedRef = useRef(false);
  const [fetching, setFetching] = useState(false);
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const client = useClient();
  const locale = useLocale();

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleChange = useEvent(async (e: SelectChangeEvent<unknown>) => {
    if (e.target.value !== FIELD_VALUE_NONE) {
      setFetching(true);
      const dimensionIri = e.target.value as string;
      const { data: hierarchyData } = await client
        .query<DimensionHierarchyQuery, DimensionHierarchyQueryVariables>(
          DimensionHierarchyDocument,
          {
            locale,
            cubeIri: chartConfig.dataSet,
            dimensionIri,
            sourceUrl: state.dataSource.url,
            sourceType: state.dataSource.type,
          }
        )
        .toPromise();
      const tree = hierarchyData?.dataCubeByIri?.dimensionByIri
        ?.hierarchy as HierarchyValue[];

      /**
       * When there are multiple hierarchies, we only want to select leaves from
       * the first hierarchy.
       */
      let hasSeenMultiHierarchyNode = false;
      const leaves = getLeaves(tree, {
        ignoreNode: (hv) => {
          if (isMultiHierarchyNode(hv)) {
            if (hasSeenMultiHierarchyNode) {
              return true;
            } else {
              hasSeenMultiHierarchyNode = true;
              return false;
            }
          } else {
            // normal node
            return false;
          }
        },
      });

      if (!unmountedRef.current) {
        dispatch({
          type: "CHART_FIELD_CHANGED",
          value: {
            locale,
            field,
            componentIri: dimensionIri,
            selectedValues: leaves,
          },
        });
        setFetching(false);
      }
    } else {
      dispatch({
        type: "CHART_FIELD_DELETED",
        value: {
          locale,
          field,
        },
      });
    }
  });

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    const chartConfig = getChartConfig(state);
    value = getFieldComponentIri(chartConfig.fields, field) ?? FIELD_VALUE_NONE;
  }

  return {
    name: field,
    value,
    onChange: handleChange,
    fetching,
  };
};

type UseChartOptionSelectFieldProps<V> = {
  field: EncodingFieldType;
  path: string;
  getValue?: (key: string) => V | undefined;
  getKey?: (value: V) => string;
};

export const useChartOptionSelectField = <V extends {} = string>(
  props: UseChartOptionSelectFieldProps<V>
): SelectProps => {
  const { field, path, getValue, getKey } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();
  const handleChange = useCallback<(e: SelectChangeEvent<unknown>) => void>(
    (e) => {
      const value = e.target.value as string;
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field,
          path,
          value: getValue ? getValue(value) : value,
        },
      });
    },
    [dispatch, locale, field, path, getValue]
  );

  let value: V | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value = get(
      getChartConfig(state),
      `fields.${field}.${path}`,
      FIELD_VALUE_NONE
    );
  }

  return {
    name: path,
    value: getKey ? getKey(value!) : (value as unknown as string),
    onChange: handleChange,
  };
};

export const useDimensionSelection = (dimensionIri: string) => {
  const [_, dispatch] = useConfiguratorState();

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

export const useChartOptionSliderField = ({
  field,
  path,
  min,
  max,
  defaultValue,
}: {
  field: EncodingFieldType | null;
  path: string;
  min: number;
  max: number;
  defaultValue: number;
}) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();

  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValidNumber = /^\d+$/.test(value) || value === "";

    if (isValidNumber) {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field,
          path,
          value: Math.max(min, Math.min(+value, max)),
        },
      });
    }
  });

  const value =
    state.state === "CONFIGURING_CHART"
      ? +getChartOptionField(state, field, path)
      : defaultValue;

  return {
    name: path,
    value,
    onChange,
  };
};

type UseChartOptionRadioFieldProps<V extends string | number> = {
  field: EncodingFieldType | null;
  path: string;
  value: V;
};

export const useChartOptionRadioField = <V extends string | number>(
  props: UseChartOptionRadioFieldProps<V>
): FieldProps => {
  const { field, path, value } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const handleChange = useCallback(() => {
    dispatch({
      type: "CHART_OPTION_CHANGED",
      value: {
        locale,
        field,
        path,
        value,
      },
    });
  }, [dispatch, locale, field, path, value]);
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? getChartOptionField(state, field, path)
      : "";
  const checked = stateValue ? stateValue === value : undefined;

  return {
    name: path,
    value,
    checked,
    onChange: handleChange,
  };
};

export const useChartOptionBooleanField = ({
  path,
  field,
  defaultValue = "",
}: {
  path: string;
  field: EncodingFieldType | null;
  defaultValue: boolean | string;
}): FieldProps => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          path,
          field,
          value: e.currentTarget.checked,
        },
      });
    },
    [locale, dispatch, path, field]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? getChartOptionField(state, field, path, defaultValue)
      : defaultValue;
  const checked = stateValue ? stateValue : false;

  return {
    name: path,
    checked,
    onChange,
  };
};

export const overrideChecked = (
  chartConfig: ChartConfig,
  field: string
): boolean => {
  return isComboChartConfig(chartConfig) && field === "y";
};

export const useActiveFieldField = ({
  value,
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = chartConfig.activeField === value;

  return {
    value,
    checked,
    onClick,
  };
};

// Specific ------------------------------------------------------------------
export const useChartType = (
  chartKey: string,
  type: "add" | "edit" = "edit",
  dimensions: DataCubeMetadataWithHierarchies["dimensions"],
  measures: DataCubeMetadataWithHierarchies["measures"]
): {
  value: ChartType;
  onChange: (chartType: ChartType) => void;
} => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state, chartKey);
  const onChange = useEvent((chartType: ChartType) => {
    if (type === "edit") {
      dispatch({
        type: "CHART_TYPE_CHANGED",
        value: {
          locale,
          chartKey,
          chartType,
        },
      });
    } else {
      dispatch({
        type: "CHART_CONFIG_ADD",
        value: {
          chartConfig: getInitialConfig({
            chartType,
            dataSet:
              state.state === "CONFIGURING_CHART"
                ? getChartConfig(state, state.activeChartKey).dataSet
                : chartConfig.dataSet,
            dimensions,
            measures,
          }),
          locale,
        },
      });
    }
  });

  const value = get(chartConfig, "chartType");

  return {
    onChange,
    value,
  };
};

// Used in the configurator filters
export const useSingleFilterSelect = ({
  dimensionIri,
}: {
  dimensionIri: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<
    (
      e:
        | Pick<SelectChangeEvent<unknown>, "target">
        | { target: { value: string } }
    ) => void
  >(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri,
          value: (e.target.value === ""
            ? FIELD_VALUE_NONE
            : e.target.value) as string,
        },
      });
    },
    [dimensionIri, dispatch]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    const chartConfig = getChartConfig(state);
    value = get(
      chartConfig,
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
      ? get(getChartConfig(state), ["filters", dimensionIri, "value"], "")
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

  return fieldChecked || !filter;
};

const MultiFilterContext = React.createContext({
  activeKeys: new Set() as Set<string>,
  allValues: [] as string[],
  dimensionIri: "",
  colorConfigPath: undefined as string | undefined,
  getValueColor: (_: string) => "" as string,
});

export const useMultiFilterContext = () => {
  return useContext(MultiFilterContext);
};

type NN<T> = NonNullable<T>;
type GQLHierarchyValue = NN<
  NN<
    NN<DimensionHierarchyQuery["dataCubeByIri"]>["dimensionByIri"]
  >["hierarchy"]
>[number];

export const MultiFilterContextProvider = ({
  dimensionIri,
  colorConfigPath,
  dimensionData,
  children,
  getValueColor,
}: {
  dimensionIri: string;
  hierarchyData: GQLHierarchyValue[] | undefined;
  dimensionData: NonNullable<
    DimensionValuesQuery["dataCubeByIri"]
  >["dimensionByIri"];
  children: React.ReactNode;
  colorConfigPath?: string;
  getValueColor: (value: string) => string;
}) => {
  const [state] = useConfiguratorState();

  const activeFilter = dimensionData
    ? getFilterValue(state, dimensionData.iri)
    : null;

  const allValues = useMemo(() => {
    return dimensionData?.values.map((d) => `${d.value}`) ?? [];
  }, [dimensionData?.values]);

  const activeKeys: Set<string> = useMemo(() => {
    if (!dimensionData) {
      return new Set();
    }

    const activeKeys = activeFilter
      ? activeFilter.type === "single"
        ? [String(activeFilter.value)]
        : activeFilter.type === "multi"
        ? Object.keys(activeFilter.values)
        : []
      : allValues;
    return new Set(activeKeys);
  }, [dimensionData, activeFilter, allValues]);

  const ctx = useMemo(() => {
    return {
      allValues,
      activeKeys,
      dimensionIri,
      colorConfigPath,
      getValueColor,
    };
  }, [allValues, dimensionIri, activeKeys, colorConfigPath, getValueColor]);

  return (
    <MultiFilterContext.Provider value={ctx}>
      {children}
    </MultiFilterContext.Provider>
  );
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
