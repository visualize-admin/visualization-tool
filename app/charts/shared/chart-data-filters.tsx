import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent, Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "urql";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import {
  getPossibleFiltersQueryVariables,
  skipPossibleFiltersQuery,
} from "@/charts/shared/possible-filters";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import SelectTree, { Tree } from "@/components/select-tree";
import {
  areDataFiltersActive,
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
  Filters,
  getFiltersByMappingStatus,
  SingleFilters,
  useChartConfigFilters,
  useConfiguratorState,
} from "@/configurator";
import { FieldLabel, LoadingIndicator } from "@/configurator/components/field";
import {
  canRenderDatePickerField,
  DatePickerField,
} from "@/configurator/components/field-date-picker";
import { extractDataPickerOptionsFromDimension } from "@/configurator/components/ui-helpers";
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
import useEvent from "@/utils/use-event";

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
  const componentIds =
    chartConfig.interactiveFiltersConfig?.dataFilters.componentIds;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (componentIds?.length === 0) {
      setOpen(false);
    }
  }, [componentIds?.length]);

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
      const unmappedEntries = Object.entries(
        cubeQueryFilters.filters as Filters
      ).filter(([k]) => unmappedKeys.includes(k));
      const interactiveFiltersList = unmappedEntries.filter(([k]) =>
        componentIds?.includes(k)
      );

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
    dataSource,
    chartConfig,
    loading,
    error,
    preparedFilters,
    componentIds,
  };
};

export const ChartDataFiltersToggle = (
  props: ReturnType<typeof useChartDataFiltersState>
) => {
  const { open, setOpen, loading, error, componentIds } = props;

  return error ? (
    <Typography variant="body2" color="error">
      <Trans id="controls.section.data.filters.possible-filters-error">
        An error happened while fetching possible filters, please retry later or
        reload the page.
      </Trans>
    </Typography>
  ) : (
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
            size="small"
            endIcon={
              <Icon
                name="add"
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

export const ChartDataFiltersList = (
  props: ReturnType<typeof useChartDataFiltersState>
) => {
  const {
    open,
    dataSource,
    chartConfig,
    loading,
    preparedFilters,
    componentIds,
  } = props;
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
  const filters = useChartConfigFilters(chartConfig);
  const chartLoadingState = useLoadingState();
  const updateDataFilter = useChartInteractiveFilters(
    (d) => d.updateDataFilter
  );
  const queryFilters = useMemo(() => {
    return getInteractiveQueryFilters({ filters, interactiveFilters });
  }, [filters, interactiveFilters]);
  const [{ data, fetching }] = useDataCubesComponentsQuery({
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
  const value = dataFilterValue ?? configFilterValue ?? FIELD_VALUE_NONE;

  useEffect(() => {
    const values = dimension?.values.map((d) => d.value) ?? [];

    // We only want to disable loading state when the filter is actually valid.
    // It can be invalid when the application is ensuring possible filters.
    if (
      (dataFilterValue && values.includes(dataFilterValue)) ||
      dataFilterValue === FIELD_VALUE_NONE
    ) {
      updateDataFilter(dimensionId, dataFilterValue);
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
          value={value as string}
          dimension={dimension}
          onChange={setDataFilter}
          disabled={disabled}
        />
      ) : hierarchy ? (
        <DataFilterHierarchyDimension
          dimension={dimension}
          onChange={setDataFilter}
          hierarchy={hierarchy}
          value={value as string}
          disabled={disabled}
        />
      ) : (
        <DataFilterGenericDimension
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
    (_, k) => !(k in interactiveFilters)
  );
  let i = 0;
  return mapValues(
    { ...nonInteractiveFilters, ...interactiveFilters },
    (v) => ({ ...v, position: i++ })
  );
};

export type DataFilterGenericDimensionProps = {
  dimension: Dimension;
  value: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
  options?: Array<{ label: string; value: string }>;
  disabled: boolean;
};

export const DataFilterGenericDimension = (
  props: DataFilterGenericDimensionProps
) => {
  const { dimension, value, onChange, options: propOptions, disabled } = props;
  const { label, isKeyDimension } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No Filter",
  });
  const options = propOptions ?? dimension.values;
  const allOptions = useMemo(() => {
    return isKeyDimension
      ? options
      : [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ];
  }, [isKeyDimension, options, noneLabel]);

  return (
    <Select
      id="dataFilterBaseDimension"
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

type DataFilterHierarchyDimensionProps = {
  dimension: Dimension;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  hierarchy?: HierarchyValue[];
  disabled: boolean;
};

export const DataFilterHierarchyDimension = (
  props: DataFilterHierarchyDimensionProps
) => {
  const { dimension, value, onChange, hierarchy, disabled } = props;
  const { label, isKeyDimension, values: dimensionValues } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });
  const options: Tree = useMemo(() => {
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

    if (!isKeyDimension) {
      opts.unshift({
        value: FIELD_VALUE_NONE,
        label: noneLabel,
        isNoneValue: true,
        hasValue: true,
      });
    }

    return opts;
  }, [hierarchy, isKeyDimension, dimensionValues, noneLabel]);

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
  dimension,
  value,
  onChange,
  disabled,
}: {
  dimension: TemporalDimension;
  value: string;
  onChange: (
    e: SelectChangeEvent<unknown> | React.ChangeEvent<HTMLSelectElement>
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
    />
  ) : (
    <DataFilterGenericDimension
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
const useEnsurePossibleInteractiveFilters = (props: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  preparedFilters?: PreparedFilter[];
}) => {
  const { dataSource, chartConfig, dashboardFilters, preparedFilters } = props;
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
