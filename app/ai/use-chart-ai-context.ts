import {
  extractChartConfigUsedComponents,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { ChartConfig, ChartType } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  hasChartConfigs,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { ObservationValue } from "@/domain/data";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { ComponentId } from "@/graphql/make-component-id";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

type Dimension = {
  id: ComponentId;
  label: string;
};

type Measure = {
  id: ComponentId;
  label: string;
};

type Observations = {
  columns: string[];
  values: ObservationValue[][];
  rowCount: number;
  truncated: boolean;
};

type DatasetMetadata = {
  iri: string;
  title: string;
  description: string;
  datePublished: string;
  themes: string[];
};

export type ChartAIContext = {
  chartType: ChartType;
  datasets: DatasetMetadata[];
  filters: DataCubeObservationFilter[];
  fields: ChartConfig["fields"];
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observations;
};

export const useChartAIContext = (): ChartAIContext => {
  const locale = useLocale();
  const [state] = useConfiguratorState(hasChartConfigs);
  const chartConfig = getChartConfig(state);
  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  } as const;

  const [{ data: metadataData }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });

  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
    keepPreviousData: true,
  });

  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters: state.dashboardFilters,
  });

  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters,
    },
    keepPreviousData: true,
  });

  const datasets = metadataData?.dataCubesMetadata ?? [];
  const dimensions = componentsData?.dataCubesComponents.dimensions ?? [];
  const measures = componentsData?.dataCubesComponents.measures ?? [];
  const observations = observationsData?.dataCubesObservations?.data ?? [];

  const dimensionSummaries: Dimension[] = dimensions.map((d) => {
    return {
      id: d.id,
      label: d.label ?? "",
    };
  });

  const measureSummaries: Measure[] = measures.map((m) => ({
    id: m.id,
    label: m.label ?? "",
  }));

  const maxRows = 200;
  const rowCount = observations.length;
  const indices = Array.from({ length: rowCount }, (_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const sampledSet = new Set(indices.slice(0, Math.min(maxRows, rowCount)));
  const truncated = rowCount > maxRows;
  const rows = observations.filter((_, idx) => sampledSet.has(idx));

  const usedDimensionIds = extractChartConfigUsedComponents(chartConfig, {
    components: [...dimensions, ...measures],
  }).map((d) => d.id);

  const values = rows.map((row) => {
    return usedDimensionIds.map((col) => {
      const v = row[col];
      return v === undefined ? null : (v as ObservationValue);
    });
  });

  const compact: ChartAIContext = {
    chartType: chartConfig.chartType,
    datasets: datasets.map((m) => ({
      iri: m.iri,
      title: m.title,
      description: m.description,
      datePublished: m.datePublished ?? "",
      themes: (m.themes ?? []).map((t) => t.label ?? ""),
    })),
    filters: queryFilters,
    fields: chartConfig.fields,
    dimensions: dimensionSummaries.filter((d) =>
      usedDimensionIds.includes(d.id)
    ),
    measures: measureSummaries.filter((m) => usedDimensionIds.includes(m.id)),
    observations:
      usedDimensionIds.length > 0
        ? {
            columns: usedDimensionIds,
            values,
            rowCount,
            truncated,
          }
        : {
            columns: [],
            values: [],
            rowCount: 0,
            truncated: false,
          },
  };

  return compact;
};
