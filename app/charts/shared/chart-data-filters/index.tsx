import { t, Trans } from "@lingui/macro";
import { Button, SelectChangeEvent, Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "urql";

import {
  groupPreparedFiltersByDimension,
  PreparedFilter,
} from "@/charts/shared/chart-data-filters/group-filters";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import {
  getPossibleFiltersQueryVariables,
  skipPossibleFiltersQuery,
} from "@/charts/shared/possible-filters";
import { Flex } from "@/components/flex";
import { Select } from "@/components/form";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { MultiSelect } from "@/components/multi-select";
import { SelectTree, Tree } from "@/components/select-tree";
import { isTableConfig } from "@/config-types";
import {
  areDataFiltersActive,
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
  Filters,
  getFiltersByMappingStatus,
  SingleFilters,
  useConfiguratorState,
} from "@/configurator";
import { FieldLabel, LoadingIndicator } from "@/configurator/components/field";
import {
  canRenderDatePickerField,
  DatePickerField,
} from "@/configurator/components/field-date-picker";
import { getOrderedTableColumns } from "@/configurator/components/ui-helpers";
import { extractDataPickerOptionsFromDimension } from "@/configurator/components/ui-helpers";
import { Option } from "@/configurator/config-form";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Dimension, HierarchyValue, TemporalDimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { getResolvedJoinById, isJoinById } from "@/graphql/join";
import {
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import {
  useChartInteractiveFilters,
  useInteractiveFiltersGetState,
} from "@/stores/interactive-filters";
import { assert } from "@/utils/assert";
import { hierarchyToOptions } from "@/utils/hierarchy";
import { useEvent } from "@/utils/use-event";

export const useChartDataFiltersState = ({
  dataSource,
  chartConfig,
  dashboardFilters,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
}) => {
  const dataFiltersConfig = chartConfig.interactiveFiltersConfig.dataFilters;
  const active = dataFiltersConfig.active;
  const defaultOpen = dataFiltersConfig.defaultOpen;
  const configComponentIds = dataFiltersConfig.componentIds;

  const componentIds = useMemo(() => {
    const excludeDashboardFilters = (id: string) => {
      return !dashboardFilters?.dataFilters.componentIds.includes(id);
    };

    if (isTableConfig(chartConfig)) {
      const orderedIds = getOrderedTableColumns(chartConfig.fields).map(
        (c) => c.componentId
      );

      return orderedIds.filter(
        (id) => configComponentIds.includes(id) && excludeDashboardFilters(id)
      );
    }

    return configComponentIds.filter(excludeDashboardFilters);
  }, [chartConfig, configComponentIds, dashboardFilters]);
  const [open, setOpen] = useState(!!defaultOpen);

  useEffect(() => {
    setOpen(!!defaultOpen);
  }, [active, defaultOpen]);

  const { loading } = useLoadingState();
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    componentIds,
  });
  const preparedFilters = useMemo(() => {
    return chartConfig.cubes.map((cube) => {
      const cubeQueryFilters = queryFilters.find((d) => d.iri === cube.iri);
      assert(cubeQueryFilters, "Cube query filters not found.");
      const filtersByMappingStatus = getFiltersByMappingStatus(chartConfig, {
        cubeIri: cube.iri,
        joinByIds: componentIds.filter(isJoinById),
      });
      const { unmappedFilters, mappedFilters } = filtersByMappingStatus;
      const unmappedKeys = Object.keys(unmappedFilters);
      const filters = cubeQueryFilters.filters ?? {};
      const unmappedEntries = Object.entries(filters).filter(
        ([unmappedComponentId]) => unmappedKeys.includes(unmappedComponentId)
      );
      const cubeComponentIds = [
        ...Object.keys(filters),
        ...Object.keys(chartConfig.fields),
        ...Object.values(chartConfig.fields).map((field) => field.componentId),
      ].filter(Boolean);

      const componentIdPairs = componentIds
        .map((originalId) => {
          const resolvedId = isJoinById(originalId)
            ? (getResolvedJoinById(cube, originalId) ?? originalId)
            : originalId;

          return { originalId, resolvedId };
        })
        .filter(({ resolvedId, originalId }) => {
          return resolvedId === originalId
            ? cubeComponentIds.includes(resolvedId)
            : true;
        });

      const componentIdResolution = Object.fromEntries(
        componentIdPairs.map(({ originalId, resolvedId }) => [
          originalId,
          resolvedId,
        ])
      );

      const interactiveFiltersList = componentIdPairs.map(
        ({ originalId, resolvedId }) => {
          const existingEntry = unmappedEntries.find(
            ([unmappedComponentId]) => unmappedComponentId === resolvedId
          );

          if (existingEntry) {
            return [originalId, existingEntry[1]];
          }

          return [originalId, undefined];
        }
      );

      return {
        cubeIri: cube.iri,
        interactiveFilters: Object.fromEntries(interactiveFiltersList),
        unmappedFilters: Object.fromEntries(unmappedEntries) as SingleFilters,
        mappedFilters,
        componentIdResolution,
      };
    });
  }, [chartConfig, componentIds, queryFilters]);
  const groupedPreparedFilters = useMemo(() => {
    return groupPreparedFiltersByDimension(preparedFilters, componentIds);
  }, [preparedFilters, componentIds]);
  const { error } = useEnsurePossibleInteractiveFilters({
    dataSource,
    chartConfig,
    preparedFilters,
    dashboardFilters,
  });

  return {
    open,
    setOpen,
    defaultOpen,
    dataSource,
    chartConfig,
    loading,
    error,
    preparedFilters,
    groupedPreparedFilters,
    componentIds,
  };
};

export const ChartDataFiltersToggle = ({
  open,
  setOpen,
  defaultOpen,
  loading,
  error,
  componentIds,
}: ReturnType<typeof useChartDataFiltersState>) => {
  return error ? (
    <Typography variant="body2" color="error">
      <Trans id="controls.section.data.filters.possible-filters-error">
        An error happened while fetching possible filters, please retry later or
        reload the page.
      </Trans>
    </Typography>
  ) : defaultOpen ? null : (
    <Flex sx={{ flexDirection: "column", width: "100%" }}>
      <Flex
        sx={{
          alignItems: "flex-start",
          gap: 3,
          minHeight: 20,
        }}
      >
        {componentIds && componentIds.length > 0 && (
          <Button
            variant="text"
            color="primary"
            size="sm"
            endIcon={
              <Icon
                name="plus"
                size={16}
                style={{
                  transform: open ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            }
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: "fit-content",
              minHeight: 0,
              ml: -2,
              px: 2,
              py: 1,
            }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {loading && (
              <span style={{ marginTop: "0.1rem", marginRight: "0.5rem" }}>
                <LoadingIndicator />
              </span>
            )}
            <Typography variant="body2">
              {open ? (
                <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
              ) : (
                <Trans id="interactive.data.filters.show">Show Filters</Trans>
              )}
            </Typography>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

// We need to include filters that are not interactive filters, to only
// show values that make sense in the context of the current filters.
export const getInteractiveQueryFilters = ({
  filters,
  interactiveFilters,
}: {
  filters: Filters;
  interactiveFilters: Filters;
}) => {
  const nonInteractiveFilters = pickBy(
    filters,
    (_, componentId) => !(componentId in interactiveFilters)
  );
  let i = 0;

  return mapValues({ ...nonInteractiveFilters, ...interactiveFilters }, (v) => {
    if (v === undefined) {
      return {
        type: "single" as const,
        value: FIELD_VALUE_NONE,
        position: i++,
      };
    }

    return { ...v, position: i++ };
  });
};

export type DataFilterGenericDimensionProps = {
  configFilter?: Filters[string];
  dimension: Dimension;
  value: string;
  values?: string[];
  isMulti?: boolean;
  onChange: (e: SelectChangeEvent<unknown>) => void;
  onMultiChange?: (values: string[]) => void;
  options?: Array<{ label: string; value: string }>;
  disabled: boolean;
};

export const DataFilterGenericDimension = ({
  configFilter,
  dimension,
  value,
  values = [],
  isMulti = false,
  onChange,
  onMultiChange,
  options: _options,
  disabled,
}: DataFilterGenericDimensionProps) => {
  const { label, isKeyDimension } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No filter",
  });
  const clearSelectionLabel = t({
    id: "controls.clear-selection",
    message: "Clear selection",
  });
  const options: Option[] = _options ?? dimension.values;
  const allOptions: Option[] = useMemo(() => {
    const clearSelectionOption = {
      value: FIELD_VALUE_NONE,
      label: clearSelectionLabel,
      isNoneValue: true,
    };

    if (!configFilter) {
      return [clearSelectionOption, ...options];
    }

    if (configFilter.type === "multi") {
      return [
        clearSelectionOption,
        ...options.filter((d) => configFilter.values[d.value]),
      ];
    }

    return isKeyDimension
      ? options
      : [
          { value: FIELD_VALUE_NONE, label: noneLabel, isNoneValue: true },
          ...options,
        ];
  }, [clearSelectionLabel, configFilter, isKeyDimension, options, noneLabel]);

  const fieldLabel = (
    <FieldLabel
      label={
        <OpenMetadataPanelWrapper component={dimension}>
          {label}
        </OpenMetadataPanelWrapper>
      }
    />
  );

  if (isMulti && onMultiChange) {
    const displayValues = values.filter((value) => value !== FIELD_VALUE_NONE);

    return (
      <MultiSelect
        id="dataFilterBaseDimension"
        label={fieldLabel}
        options={allOptions}
        value={displayValues}
        onChange={onMultiChange}
        size="sm"
        disabled={disabled}
        placeholder={noneLabel}
      />
    );
  }

  return (
    <Select
      id="dataFilterBaseDimension"
      size="sm"
      label={fieldLabel}
      options={allOptions}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export const DataFilterHierarchyDimension = ({
  configFilter,
  dimension,
  value,
  values = [],
  isMulti = false,
  onChange,
  onMultiChange,
  hierarchy,
  disabled,
}: {
  configFilter?: Filters[string];
  dimension: Dimension;
  value: string;
  values?: string[];
  isMulti?: boolean;
  onChange: (e: { target: { value: string } }) => void;
  onMultiChange?: (values: string[]) => void;
  hierarchy?: HierarchyValue[];
  disabled: boolean;
}) => {
  const { label, isKeyDimension, values: dimensionValues } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No filter",
  });
  const options: Tree = useMemo(() => {
    const noneOption = {
      value: FIELD_VALUE_NONE,
      label: noneLabel,
      isNoneValue: true,
      hasValue: true,
    };

    const opts = (
      hierarchy
        ? hierarchyToOptions(
            hierarchy,
            dimensionValues.map((d) => d.value)
          )
        : dimensionValues
    ) as {
      label: string;
      value: string;
      isNoneValue?: boolean;
      hasValue: boolean;
    }[];

    if (!configFilter) {
      return [noneOption, ...opts];
    }

    if (configFilter.type === "multi") {
      const filteredOptions = filterTreeRecursively(opts, configFilter);
      return [noneOption, ...filteredOptions];
    }

    if (!isKeyDimension || configFilter.type !== "single") {
      opts.unshift(noneOption);
    }

    return opts;
  }, [noneLabel, hierarchy, dimensionValues, configFilter, isKeyDimension]);

  const handleChange = useEvent(
    (e: { target: { value: string | string[] } }) => {
      if (isMulti && onMultiChange && Array.isArray(e.target.value)) {
        onMultiChange(e.target.value);
      } else if (!isMulti && typeof e.target.value === "string") {
        onChange({ target: { value: e.target.value } });
      }
    }
  );

  const displayValues = isMulti
    ? values.filter((value) => value !== FIELD_VALUE_NONE)
    : [];
  const displayValue = isMulti ? displayValues : value;

  return (
    <SelectTree
      value={displayValue}
      options={options}
      onChange={handleChange}
      isMulti={isMulti}
      label={
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper component={dimension}>
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
      disabled={disabled}
    />
  );
};

export const DataFilterTemporalDimension = ({
  configFilter,
  dimension,
  value,
  onChange,
  disabled,
}: {
  configFilter?: Filters[string];
  dimension: TemporalDimension;
  value: string;
  onChange: (
    e: SelectChangeEvent<unknown> | ChangeEvent<HTMLSelectElement>
  ) => void;
  disabled: boolean;
}) => {
  const { label, timeUnit, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);

  const { minDate, maxDate, options, optionValues } = useMemo(() => {
    return extractDataPickerOptionsFromDimension({
      dimension,
      parseDate,
    });
  }, [dimension, parseDate]);

  return canRenderDatePickerField(timeUnit) ? (
    <DatePickerField
      name={`interactive-date-picker-${dimension.id}`}
      label={
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper component={dimension}>
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
      value={parseDate(value) as Date}
      onChange={onChange}
      isDateDisabled={(d) => !optionValues.includes(formatDate(d))}
      timeUnit={timeUnit}
      dateFormat={formatDate}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      parseDate={parseDate}
      showClearButton={configFilter?.type !== "single"}
    />
  ) : (
    <DataFilterGenericDimension
      configFilter={configFilter}
      dimension={dimension}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

/**
 * This runs every time the state changes and it ensures that the selected interactive
 * filters return at least 1 observation. Otherwise they are reloaded.
 *
 * This behavior is disabled when the dashboard filters are active.
 */
const useEnsurePossibleInteractiveFilters = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  preparedFilters,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  preparedFilters?: PreparedFilter[];
}) => {
  const [, dispatch] = useConfiguratorState();
  const loadingState = useLoadingState();
  const [error, setError] = useState<Error>();
  const lastFilters = useRef<Record<string, Filters>>({});
  const client = useClient();
  const getInteractiveFiltersState = useInteractiveFiltersGetState();
  const setDataFilters = useChartInteractiveFilters((d) => d.setDataFilters);
  const filtersByCubeIri = useMemo(() => {
    return preparedFilters?.reduce<Record<string, PreparedFilter>>((acc, d) => {
      acc[d.cubeIri] = d;
      return acc;
    }, {});
  }, [preparedFilters]);

  const dataFiltersActive = areDataFiltersActive(dashboardFilters);

  useEffect(() => {
    const run = async () => {
      if (!filtersByCubeIri || dataFiltersActive) {
        return;
      }

      chartConfig.cubes.forEach(async (cube) => {
        const { mappedFilters, unmappedFilters, interactiveFilters } =
          filtersByCubeIri[cube.iri];

        if (
          skipPossibleFiltersQuery(
            lastFilters.current[cube.iri],
            unmappedFilters
          )
        ) {
          return;
        }

        lastFilters.current[cube.iri] = unmappedFilters;
        loadingState.set("possible-interactive-filters", true);
        const variables = getPossibleFiltersQueryVariables({
          cubeIri: cube.iri,
          dataSource,
          unmappedFilters,
        });
        const { data, error } = await client
          .query<
            PossibleFiltersQuery,
            PossibleFiltersQueryVariables
          >(PossibleFiltersDocument, variables)
          .toPromise();

        if (error || !data) {
          setError(error);
          loadingState.set("possible-interactive-filters", false);
          console.error("Could not fetch possible filters", error);

          return;
        }

        setError(undefined);
        loadingState.set("possible-interactive-filters", false);

        const filters = Object.assign(
          Object.fromEntries(
            data.possibleFilters.map((d) => {
              const interactiveFilter = interactiveFilters[d.id];
              return [
                d.id,
                {
                  type: d.type,
                  value:
                    // We want to keep the none filter without overriding them.
                    interactiveFilter?.type === "single" &&
                    interactiveFilter.value === FIELD_VALUE_NONE
                      ? FIELD_VALUE_NONE
                      : d.value,
                },
              ];
            })
          ) as Filters,
          mappedFilters
        );

        // We need to get the values dynamically, as they can get updated by
        // useSyncInteractiveFilters and this callback runs with old value.
        const dataFilters = { ...getInteractiveFiltersState().dataFilters };
        const filtersToUpdate = Object.fromEntries(
          Object.entries(filters).filter(
            ([k, v]) => k in dataFilters && v.type === "single"
          )
        );

        if (
          !isEqual(filtersToUpdate, interactiveFilters) &&
          !isEmpty(filtersToUpdate)
        ) {
          for (const [k, v] of Object.entries(filters)) {
            if (k in dataFilters && v.type === "single") {
              dataFilters[k] = v;
            }
          }

          setDataFilters(dataFilters);
        }
      });
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig.fields,
    chartConfig.cubes,
    dataSource,
    setDataFilters,
    loadingState,
    filtersByCubeIri,
    getInteractiveFiltersState,
    dataFiltersActive,
  ]);

  return { error };
};

const filterTreeRecursively = (
  options: Tree,
  configFilter: Filters[string]
): Tree => {
  if (!configFilter || configFilter.type !== "multi") {
    return options;
  }

  const shouldIncludeNode = (node: Tree[number]): boolean => {
    if (configFilter.values[node.value]) {
      return true;
    }

    if (node.children && node.children.length > 0) {
      return node.children.some(shouldIncludeNode);
    }

    return false;
  };

  const filterNode = (node: Tree[number]): Tree[number] | null => {
    if (shouldIncludeNode(node)) {
      const filteredChildren = node.children
        ? node.children
            .map(filterNode)
            .filter((child): child is Tree[number] => child !== null)
        : undefined;

      return {
        ...node,
        children: filteredChildren,
        selectable: configFilter
          ? !!configFilter.values[node.value]
          : !!node.hasValue,
      };
    }

    return null;
  };

  return options
    .map(filterNode)
    .filter((node): node is Tree[number] => node !== null);
};
