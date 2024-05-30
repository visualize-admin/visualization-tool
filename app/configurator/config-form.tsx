import { SelectChangeEvent, SelectProps } from "@mui/material";
import get from "lodash/get";
import React, {
  ChangeEvent,
  createContext,
  InputHTMLAttributes,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { getFieldComponentIri, getInitialConfig } from "@/charts";
import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ChartType,
  ConfiguratorState,
  Filters,
  getChartConfig,
  isComboChartConfig,
} from "@/config-types";
import {
  getChartOptionField,
  GetConfiguratorStateAction,
  getFilterValue,
  isConfiguring,
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Component,
  Dimension,
  DimensionValue,
  HierarchyValue,
  isMeasure,
  Measure,
} from "@/domain/data";
import { useLocale } from "@/locales/use-locale";
import { bfs } from "@/utils/bfs";
import { isMultiHierarchyNode } from "@/utils/hierarchy";
import useEvent from "@/utils/use-event";

export type Option = {
  value: string | $FixMe;
  label: string | $FixMe;
  position?: DimensionValue["position"];
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
      if (ignoreNode?.(node)) {
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
  components,
}: {
  field: EncodingFieldType;
  components: Component[];
}): SelectProps => {
  const [state, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const handleChange = useEvent(async (e: SelectChangeEvent<unknown>) => {
    if (e.target.value !== FIELD_VALUE_NONE) {
      const dimensionIri = e.target.value as string;
      const dimension = components.find(
        (c) => c.iri === dimensionIri
      ) as Component;
      const hierarchy = (isMeasure(dimension) ? [] : dimension.hierarchy) ?? [];

      /**
       * When there are multiple hierarchies, we only want to select leaves from
       * the first hierarchy.
       */
      let hasSeenMultiHierarchyNode = false;
      const leaves = getLeaves(hierarchy, {
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

      dispatch({
        type: "CHART_FIELD_CHANGED",
        value: {
          locale,
          field,
          componentIri: dimensionIri,
          selectedValues: leaves,
        },
      });
      return;
    }
    dispatch({
      type: "CHART_FIELD_DELETED",
      value: {
        locale,
        field,
      },
    });
  });

  let value: string | undefined;

  if (isConfiguring(state)) {
    const chartConfig = getChartConfig(state);
    value = getFieldComponentIri(chartConfig.fields, field) ?? FIELD_VALUE_NONE;
  }

  return {
    name: field,
    value,
    onChange: handleChange,
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

  if (isConfiguring(state)) {
    value = get(
      getChartConfig(state),
      `fields["${field}"].${path}`,
      FIELD_VALUE_NONE
    );
  }

  return {
    name: path,
    value: getKey ? getKey(value!) : (value as unknown as string),
    onChange: handleChange,
  };
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

  const value = isConfiguring(state)
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
  const stateValue = getChartOptionField(state, field, path);
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
  const stateValue = isConfiguring(state)
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

type UseActiveFieldProps = {
  value: string;
};

export const useActiveChartField = (
  props: UseActiveFieldProps
): FieldProps & {
  onClick: (x: string) => void;
} => {
  const { value } = props;
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onClick = useCallback(() => {
    dispatch({ type: "CHART_ACTIVE_FIELD_CHANGED", value });
  }, [dispatch, value]);
  const checked = chartConfig.activeField === value;

  return {
    value,
    checked,
    onClick,
  };
};

export const useActiveLayoutField = (
  props: UseActiveFieldProps
): FieldProps & {
  onClick: (x: string) => void;
} => {
  const { value } = props;
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const onClick = useCallback(() => {
    dispatch({ type: "LAYOUT_ACTIVE_FIELD_CHANGED", value });
  }, [dispatch, value]);
  const checked = state.layout.activeField === value;

  return {
    value,
    checked,
    onClick,
  };
};

// Specific ------------------------------------------------------------------
export const getNewChartConfig = ({
  chartType,
  chartConfig,
  state,
  dimensions,
  measures,
}: {
  chartType: ChartType;
  chartConfig: ChartConfig;
  state: ConfiguratorState;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const cube = isConfiguring(state)
    ? getChartConfig(state, state.activeChartKey).cubes[0]
    : chartConfig.cubes[0];

  return getInitialConfig({
    chartType,
    iris: [{ iri: cube.iri, publishIri: cube.publishIri }],
    dimensions,
    measures,
  });
};

export const useAddOrEditChartType = (
  chartKey: string,
  type: "add" | "edit" = "edit",
  dimensions: Dimension[],
  measures: Measure[]
): {
  value: ChartType;
  addOrEditChartType: (chartType: ChartType) => void;
} => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state, chartKey);
  const addOrEditChartType = useEvent((chartType: ChartType) => {
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
          chartConfig: getNewChartConfig({
            chartType,
            chartConfig,
            state,
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
    addOrEditChartType,
    value,
  };
};

// Used in the configurator filters
export const useSingleFilterSelect = (
  filters: GetConfiguratorStateAction<"CHART_CONFIG_FILTER_SET_SINGLE">["value"]["filters"]
) => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<
    (
      e:
        | Pick<SelectChangeEvent<unknown>, "target">
        | { target: { value: string } }
    ) => void
  >(
    (e) => {
      const value = e.target.value as string;

      if (value === FIELD_VALUE_NONE) {
        dispatch({
          type: "CHART_CONFIG_FILTER_REMOVE_SINGLE",
          value: {
            filters,
          },
        });
      } else {
        dispatch({
          type: "CHART_CONFIG_FILTER_SET_SINGLE",
          value: {
            filters,
            value: value === "" ? FIELD_VALUE_NONE : value,
          },
        });
      }
    },
    [dispatch, filters]
  );

  let value = FIELD_VALUE_NONE;

  if (isConfiguring(state)) {
    const chartConfig = getChartConfig(state);
    for (const filter of filters) {
      const { cubeIri, dimensionIri } = filter;
      const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

      if (cube) {
        value = get(cube, ["filters", dimensionIri, "value"], FIELD_VALUE_NONE);
      }
    }
  }

  return {
    value,
    onChange,
  };
};

// Used in the Table Chart options
export const useSingleFilterField = ({
  filters,
  value,
}: {
  filters: GetConfiguratorStateAction<"CHART_CONFIG_FILTER_SET_SINGLE">["value"]["filters"];
  value: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          filters: filters,
          value: e.currentTarget.value,
        },
      });
    },
    [dispatch, filters]
  );

  // TODO Fix
  const dimensionIri = filters[0].dimensionIri;
  const stateValue = isConfiguring(state)
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
  filters: Filters,
  dimensionIri: string,
  value: string
) => {
  const filter = filters[dimensionIri];
  const fieldChecked =
    filter?.type === "multi" ? filter.values?.[value] ?? false : false;

  return fieldChecked || !filter;
};

const MultiFilterContext = createContext({
  activeKeys: new Set() as Set<string>,
  allValues: [] as string[],
  cubeIri: "",
  dimensionIri: "",
  colorConfigPath: undefined as string | undefined,
  getValueColor: (_: string) => "" as string,
});

export const useMultiFilterContext = () => {
  return useContext(MultiFilterContext);
};

export const MultiFilterContextProvider = ({
  dimension,
  colorConfigPath,
  children,
  getValueColor,
}: {
  dimension: Dimension;
  children: React.ReactNode;
  colorConfigPath?: string;
  getValueColor: (value: string) => string;
}) => {
  const [state] = useConfiguratorState();
  const activeFilter = getFilterValue(state, dimension);
  const allValues = useMemo(() => {
    return dimension.values.map((d) => `${d.value}`) ?? [];
  }, [dimension.values]);
  const activeKeys: Set<string> = useMemo(() => {
    const activeKeys = activeFilter
      ? activeFilter.type === "single"
        ? [String(activeFilter.value)]
        : activeFilter.type === "multi"
          ? Object.keys(activeFilter.values)
          : []
      : allValues;
    return new Set(activeKeys);
  }, [activeFilter, allValues]);

  const ctx = useMemo(() => {
    return {
      allValues,
      activeKeys,
      cubeIri: dimension.cubeIri,
      dimensionIri: dimension.iri,
      colorConfigPath,
      getValueColor,
    };
  }, [
    allValues,
    dimension.cubeIri,
    dimension.iri,
    activeKeys,
    colorConfigPath,
    getValueColor,
  ]);

  return (
    <MultiFilterContext.Provider value={ctx}>
      {children}
    </MultiFilterContext.Provider>
  );
};

export const useMetaField = ({
  type,
  metaKey,
  locale,
  value,
}: {
  type: "chart" | "layout";
  metaKey: string;
  locale: string;
  value?: string;
}): FieldProps => {
  const [, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: `${
          type.toUpperCase() as Uppercase<typeof type>
        }_ANNOTATION_CHANGED`,
        value: {
          path: `${metaKey}.${locale}`,
          value: e.currentTarget.value,
        },
      });
    },
    [type, dispatch, metaKey, locale]
  );

  return {
    name: `${metaKey}-${locale}`,
    value,
    onChange,
  };
};
