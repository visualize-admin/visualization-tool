import { SelectChangeEvent } from "@mui/material";
import { useEffect, useMemo } from "react";

import {
  DataFilterGenericDimension,
  DataFilterHierarchyDimension,
  DataFilterTemporalDimension,
  getInteractiveQueryFilters,
} from "@/charts/shared/chart-data-filters";
import { GroupedPreparedFilterEntry } from "@/charts/shared/chart-data-filters/group-filters";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import { Flex } from "@/components/flex";
import { Loading } from "@/components/hint";
import {
  ChartConfig,
  DataSource,
  Filters,
  FilterValueMulti,
  FilterValueSingle,
} from "@/config-types";
import { getChartConfigFilters } from "@/config-utils";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isTemporalDimension } from "@/domain/data";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";
import {
  DataFilters,
  useChartInteractiveFilters,
} from "@/stores/interactive-filters";
import { useResolveMostRecentValue } from "@/utils/most-recent-value";
import { useEvent } from "@/utils/use-event";

export const ChartDataFilter = ({
  dimensionId,
  dataSource,
  chartConfig,
  dataFilters,
  filters,
  disabled,
}: {
  dimensionId: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFilters: DataFilters;
  filters: GroupedPreparedFilterEntry[];
  disabled: boolean;
}) => {
  const locale = useLocale();
  const chartLoadingState = useLoadingState();
  const updateDataFilter = useChartInteractiveFilters(
    (d) => d.updateDataFilter
  );
  const setMultiDataFilter = useChartInteractiveFilters(
    (d) => d.setMultiDataFilter
  );
  const perCube = useMemo(() => {
    return filters.map((f) => {
      const cubeFilters = getChartConfigFilters(chartConfig.cubes, {
        cubeIri: f.cubeIri,
      });
      const interactiveFiltersResolved = Object.fromEntries(
        Object.entries(f.interactiveFilters).map(([k, v]) => [
          f.componentIdResolution[k] ?? k,
          v,
        ])
      ) as Filters;
      const interactiveQueryFilters = getInteractiveQueryFilters({
        filters: cubeFilters,
        interactiveFilters: interactiveFiltersResolved,
      });
      const resolvedQueryFilters = Object.fromEntries(
        Object.entries(interactiveQueryFilters).map(([k, v]) => [
          f.componentIdResolution[k] ?? k,
          v,
        ])
      );
      return {
        cubeIri: f.cubeIri,
        resolvedDimensionId: f.resolvedDimensionId,
        resolvedQueryFilters,
      };
    });
  }, [filters, chartConfig.cubes]);

  const filterKeys = useMemo(() => {
    return perCube
      .map((d) => {
        return Object.entries(d.resolvedQueryFilters)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(",");
      })
      .join(" | ");
  }, [perCube]);

  const [{ data, fetching }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: perCube.map((d) => ({
        iri: d.cubeIri,
        componentIds: [d.resolvedDimensionId],
        filters: d.resolvedQueryFilters,
        loadValues: true,
      })),
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order.
      // @ts-ignore
      filterKeys,
    },
    keepPreviousData: true,
  });

  const dimension = data?.dataCubesComponents.dimensions[0];

  const hierarchy = dimension?.hierarchy;

  const setDataFilter = useEvent(
    (
      e: SelectChangeEvent<unknown> | { target: { value: string | string[] } }
    ) => {
      const value = e.target.value as string | string[];

      if (Array.isArray(value)) {
        setMultiDataFilter(dimensionId, value);
      } else {
        updateDataFilter(dimensionId, value);
      }
    }
  );

  const handleMultiChange = useEvent((values: string[]) => {
    setMultiDataFilter(dimensionId, values);
  });

  const singleEntry = filters.length === 1 ? filters[0] : undefined;
  const configFilter = useMemo(() => {
    if (!singleEntry || !dimension) {
      return undefined;
    }

    const cubeFilters = getChartConfigFilters(chartConfig.cubes, {
      cubeIri: singleEntry.cubeIri,
    });

    return cubeFilters[dimension.id];
  }, [dimension, chartConfig.cubes, singleEntry]);
  const configFilterValue =
    configFilter && configFilter.type === "single"
      ? configFilter.value
      : undefined;
  const dataFilterValue = dimension
    ? dataFilters[dimensionId]?.type === "single"
      ? (dataFilters[dimensionId] as FilterValueSingle).value
      : null
    : null;

  const dataFilterValues = dimension
    ? dataFilters[dimensionId]?.type === "multi"
      ? Object.keys(
          (dataFilters[dimensionId] as FilterValueMulti | undefined)?.values ??
            {}
        )
      : dataFilters[dimensionId]?.type === "single"
        ? [(dataFilters[dimensionId] as FilterValueSingle).value as string]
        : []
    : [];

  const filterType =
    chartConfig.interactiveFiltersConfig.dataFilters.filterTypes[dimensionId] ??
    (configFilter?.type === "multi" ? "multi" : "single");

  const isMultiFilter = filterType === "multi";

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

  const multiValue = isMultiFilter
    ? dataFilterValues
    : [value].filter((v) => v !== FIELD_VALUE_NONE).map((v) => String(v));

  useEffect(() => {
    const values = dimension?.values.map((d) => d.value) ?? [];

    if (isMultiFilter) {
      chartLoadingState.set(`interactive-filter-${dimensionId}`, fetching);
      return;
    }

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
    isMultiFilter,
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
          onMultiChange={handleMultiChange}
          hierarchy={hierarchy}
          value={value as string}
          values={multiValue}
          isMulti={isMultiFilter}
          disabled={disabled}
        />
      ) : (
        <DataFilterGenericDimension
          configFilter={configFilter}
          dimension={dimension}
          onChange={setDataFilter}
          value={value as string}
          values={multiValue}
          isMulti={isMultiFilter}
          onMultiChange={handleMultiChange}
          disabled={disabled}
        />
      )}
    </Flex>
  ) : (
    <Loading />
  );
};
