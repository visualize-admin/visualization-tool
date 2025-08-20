import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent, Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "urql";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import {
  getPossibleFiltersQueryVariables,
  skipPossibleFiltersQuery,
} from "@/charts/shared/possible-filters";
import { Flex } from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { SelectTree, Tree } from "@/components/select-tree";
import { isTableConfig } from "@/config-types";
import { useChartConfigFilters } from "@/config-utils";
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
import {
  Dimension,
  HierarchyValue,
  isTemporalDimension,
  TemporalDimension,
} from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import {
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import {
  DataFilters,
  useChartInteractiveFilters,
  useInteractiveFiltersGetState,
} from "@/stores/interactive-filters";
import { assert } from "@/utils/assert";
import { hierarchyToOptions } from "@/utils/hierarchy";
import { useResolveMostRecentValue } from "@/utils/most-recent-value";
import { useEvent } from "@/utils/use-event";

type PreparedFilter = {
  cubeIri: string;
  interactiveFilters: Filters;
  unmappedFilters: SingleFilters;
  mappedFilters: Filters;
};

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
    if (isTableConfig(chartConfig)) {
      const orderedIds = getOrderedTableColumns(chartConfig.fields).map(
        (c) => c.componentId
      );

      return orderedIds.filter((id) => configComponentIds.includes(id));
    }

    return configComponentIds;
  }, [chartConfig, configComponentIds]);
  const [open, setOpen] = useState<boolean>(!!defaultOpen);

  useEffect(() => {
    if (componentIds.length === 0) {
      setOpen(false);
    }
  }, [componentIds.length]);

  useEffect(() => {
    setOpen(!!defaultOpen);
  }, [active, defaultOpen]);

  const { loading } = useLoadingState();
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    allowNoneValues: true,
    componentIds,
  });
  const preparedFilters = useMemo(() => {
    return chartConfig.cubes.map((cube) => {
      const cubeQueryFilters = queryFilters.find((d) => d.iri === cube.iri);
      assert(cubeQueryFilters, "Cube query filters not found.");
      const filtersByMappingStatus = getFiltersByMappingStatus(chartConfig, {
        cubeIri: cube.iri,
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
      ];
      const interactiveFiltersList = componentIds
        .filter((componentId) => cubeComponentIds.includes(componentId))
        .map((componentId) => {
          const existingEntry = unmappedEntries.find(
            ([unmappedComponentId]) => unmappedComponentId === componentId
          );

          if (existingEntry) {
            return existingEntry;
          }

          return [componentId, undefined];
        });

      return {
        cubeIri: cube.iri,
        interactiveFilters: Object.fromEntries(interactiveFiltersList),
        unmappedFilters: Object.fromEntries(unmappedEntries) as SingleFilters,
        mappedFilters,
      };
    });
  }, [chartConfig, componentIds, queryFilters]);
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
            onClick={() => setOpen(!open)}
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

export const ChartDataFiltersList = ({
  open,
  dataSource,
  chartConfig,
  loading,
  preparedFilters,
  componentIds,
}: ReturnType<typeof useChartDataFiltersState>) => {
  const dataFilters = useChartInteractiveFilters((d) => d.dataFilters);

  return componentIds && componentIds.length > 0 ? (
    <Box
      data-testid="published-chart-interactive-filters"
      sx={{
        display: open ? "grid" : "none",
        columnGap: 3,
        rowGap: 2,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}
    >
      {preparedFilters.map(({ cubeIri, interactiveFilters }) => {
        return Object.keys(interactiveFilters).map((dimensionId) => {
          return (
            <DataFilter
              key={dimensionId}
              cubeIri={cubeIri}
              dimensionId={dimensionId}
              dataSource={dataSource}
              chartConfig={chartConfig}
              dataFilters={dataFilters}
              interactiveFilters={interactiveFilters}
              disabled={loading}
            />
          );
        });
      })}
    </Box>
  ) : null;
};

const DataFilter = ({
  cubeIri,
  dimensionId,
  dataSource,
  chartConfig,
  dataFilters,
  interactiveFilters,
  disabled,
}: {
  cubeIri: string;
  dimensionId: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFilters: DataFilters;
  interactiveFilters: Filters;
  disabled: boolean;
}) => {
  const locale = useLocale();
  const filters = useChartConfigFilters(chartConfig, { cubeIri });
  const chartLoadingState = useLoadingState();
  const updateDataFilter = useChartInteractiveFilters(
    (d) => d.updateDataFilter
  );
  const queryFilters = useMemo(() => {
    return getInteractiveQueryFilters({ filters, interactiveFilters });
  }, [filters, interactiveFilters]);
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: [
        {
          iri: cubeIri,
          componentIds: [dimensionId],
          filters: queryFilters,
          loadValues: true,
        },
      ],
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order.
      // @ts-ignore
      filterKeys: Object.keys(queryFilters).join(", "),
    },
    keepPreviousData: true,
  });

  const dimension = data?.dataCubesComponents.dimensions[0];
  const hierarchy = dimension?.hierarchy;

  const setDataFilter = useEvent(
    (e: SelectChangeEvent<unknown> | { target: { value: string } }) => {
      updateDataFilter(dimensionId, e.target.value as string);
    }
  );

  const configFilter = dimension ? filters[dimension.id] : undefined;
  const configFilterValue =
    configFilter && configFilter.type === "single"
      ? configFilter.value
      : undefined;
  const dataFilterValue = dimension ? dataFilters[dimension.id]?.value : null;

  const resolvedDataFilterValue = useResolveMostRecentValue(
    dataFilterValue,
    dimension
  );
  const resolvedConfigFilterValue = useResolveMostRecentValue(
    configFilterValue,
    dimension
  );
  const value =
    resolvedDataFilterValue ?? resolvedConfigFilterValue ?? FIELD_VALUE_NONE;

  useEffect(() => {
    const values = dimension?.values.map((d) => d.value) ?? [];

    // We only want to disable loading state when the filter is actually valid.
    // It can be invalid when the application is ensuring possible filters.
    if (
      (resolvedDataFilterValue && values.includes(resolvedDataFilterValue)) ||
      resolvedDataFilterValue === FIELD_VALUE_NONE ||
      !configFilter
    ) {
      updateDataFilter(
        dimensionId,
        resolvedDataFilterValue ? resolvedDataFilterValue : FIELD_VALUE_NONE
      );
      chartLoadingState.set(`interactive-filter-${dimensionId}`, fetching);
    } else if (fetching || values.length === 0) {
      chartLoadingState.set(`interactive-filter-${dimensionId}`, fetching);
    }
  }, [
    chartLoadingState,
    dataFilterValue,
    dimension?.values,
    dimensionId,
    fetching,
    setDataFilter,
    configFilterValue,
    updateDataFilter,
    configFilter,
    resolvedDataFilterValue,
  ]);

  return dimension ? (
    <Flex
      sx={{
        mr: 3,
        width: "100%",
        flex: "1 1 100%",
        ":last-of-type": {
          mr: 0,
        },
        " > div": { width: "100%" },
      }}
    >
      {isTemporalDimension(dimension) ? (
        <DataFilterTemporalDimension
          configFilter={configFilter}
          value={value as string}
          dimension={dimension}
          onChange={setDataFilter}
          disabled={disabled}
        />
      ) : hierarchy ? (
        <DataFilterHierarchyDimension
          configFilter={configFilter}
          dimension={dimension}
          onChange={setDataFilter}
          hierarchy={hierarchy}
          value={value as string}
          disabled={disabled}
        />
      ) : (
        <DataFilterGenericDimension
          configFilter={configFilter}
          dimension={dimension}
          onChange={setDataFilter}
          value={value as string}
          disabled={disabled}
        />
      )}
    </Flex>
  ) : (
    <Loading />
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
  onChange: (e: SelectChangeEvent<unknown>) => void;
  options?: Array<{ label: string; value: string }>;
  disabled: boolean;
};

export const DataFilterGenericDimension = ({
  configFilter,
  dimension,
  value,
  onChange,
  options: _options,
  disabled,
}: DataFilterGenericDimensionProps) => {
  const { label, isKeyDimension } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No Filter",
  });
  const options: Option[] = _options ?? dimension.values;
  const allOptions: Option[] = useMemo(() => {
    const noneOption = {
      value: FIELD_VALUE_NONE,
      label: noneLabel,
      isNoneValue: true,
    };

    if (!configFilter) {
      return [noneOption, ...options];
    }

    if (configFilter.type === "multi") {
      return [
        noneOption,
        ...options.filter((d) => configFilter.values[d.value]),
      ];
    }

    return isKeyDimension ? options : [noneOption, ...options];
  }, [noneLabel, configFilter, isKeyDimension, options]);

  return (
    <Select
      id="dataFilterBaseDimension"
      size="sm"
      label={
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper component={dimension}>
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
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
  onChange,
  hierarchy,
  disabled,
}: {
  configFilter?: Filters[string];
  dimension: Dimension;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  hierarchy?: HierarchyValue[];
  disabled: boolean;
}) => {
  const { label, isKeyDimension, values: dimensionValues } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
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

  return (
    <SelectTree
      value={value}
      options={options}
      onChange={onChange}
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
