import { makeStyles } from "@mui/styles";
import { AnimatePresence } from "framer-motion";
import keyBy from "lodash/keyBy";
import {
  ComponentProps,
  createElement,
  ElementType,
  useEffect,
  useMemo,
  useState,
} from "react";

import { A11yTable } from "@/charts/shared/a11y-table";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import { ChartProps } from "@/charts/shared/chart-props";
import { EmbedQueryParams } from "@/components/embed-params";
import { Flex } from "@/components/flex";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import { ChartConfig, DataSource } from "@/configurator";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsPaginatedQuery,
} from "@/graphql/hooks";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

type ElementProps<RE> = RE extends ElementType<infer P> ? P : never;

const useStyles = makeStyles(() => ({
  dataWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
}));

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
  sortBy?: Array<{ id: string; desc: boolean }>;
};

/**
 * Responsible for fetching paginated data for the table chart.
 * - Provides paginated observations, dimensions and measures to the chart Component
 * - Handles loading & error state
 * - Manages pagination state
 */
const TablePaginatedDataWrapperInner = <
  TChartConfig extends ChartConfig,
  TOtherProps,
  TChartComponent extends ElementType,
>({
  chartConfig,
  LoadingOverlayComponent = LoadingOverlay,
  Component,
  ComponentProps,
  componentIds,
  dataSource,
  embedParams,
  observationQueryFilters,
  fetching: fetchingProp = false,
  error: propError,
}: {
  chartConfig: TChartConfig;
  LoadingOverlayComponent?: ElementType;
  Component: TChartComponent;
  ComponentProps?: Omit<
    ElementProps<TChartComponent>,
    keyof ChartProps<TChartConfig>
  >;
  componentIds?: string[];
  dataSource: DataSource;
  embedParams?: EmbedQueryParams;
  observationQueryFilters: DataCubeObservationFilter[];
  fetching?: boolean;
  error?: Error;
}) => {
  const chartLoadingState = useLoadingState();
  const classes = useStyles();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });

  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };

  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
    keepPreviousData: true,
  });

  const [componentsQuery] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIds,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
    keepPreviousData: true,
  });

  const paginatedObservationQueryFilters = useMemo(
    () =>
      observationQueryFilters.map((filter) => {
        // Combine configured sorting with dynamic sorting
        const configSorting = (chartConfig as any).sorting?.map((sort: any) => ({
          componentId: sort.componentId,
          order: sort.sortingOrder === "desc" ? ("DESC" as const) : ("ASC" as const),
        })) || [];

        // Convert dynamic sorting to server format
        const dynamicSorting = pagination.sortBy?.map((sort) => {
          return {
            componentId: sort.id,
            order: sort.desc ? ("DESC" as const) : ("ASC" as const),
          };
        }) || [];

        // Dynamic sorting takes precedence over config sorting
        const orderBy = dynamicSorting.length > 0 ? dynamicSorting : configSorting;

        return {
          ...filter,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          orderBy,
        };
      }),
    [observationQueryFilters, pagination.pageIndex, pagination.pageSize, pagination.sortBy, chartConfig]
  );

  const [observationsPaginatedQuery] = useDataCubesObservationsPaginatedQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: paginatedObservationQueryFilters,
    },
    keepPreviousData: true,
  });

  const {
    data: metadataData,
    fetching: fetchingMetadata,
    error: metadataError,
  } = metadataQuery;
  const {
    data: componentsData,
    fetching: fetchingComponents,
    error: componentsError,
  } = componentsQuery;
  const {
    data: observationsPaginatedData,
    fetching: fetchingObservations,
    error: observationsError,
  } = observationsPaginatedQuery;

  const metadata = metadataData?.dataCubesMetadata;
  const observations =
    observationsPaginatedData?.dataCubesObservationsPaginated?.data?.data;
  const paginationInfo =
    observationsPaginatedData?.dataCubesObservationsPaginated?.pagination;
  const dimensions = componentsData?.dataCubesComponents.dimensions;
  const measures = componentsData?.dataCubesComponents.measures;

  const fetching =
    fetchingProp ||
    fetchingMetadata ||
    fetchingComponents ||
    fetchingObservations;
  const error =
    propError || metadataError || componentsError || observationsError;

  useEffect(() => {
    chartLoadingState.set("data", fetching);
  }, [chartLoadingState, fetching]);

  const { dimensionsById, measuresById } = useMemo(() => {
    return {
      dimensionsById: keyBy(dimensions ?? [], (d) => d.id),
      measuresById: keyBy(measures ?? [], (d) => d.id),
    };
  }, [dimensions, measures]);

  const canNextPage = paginationInfo?.hasNextPage ?? false;
  const canPreviousPage = paginationInfo?.hasPreviousPage ?? false;
  const totalCount = paginationInfo?.totalCount ?? 0;

  const nextPage = () => {
    if (canNextPage) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex + 1,
      }));
    }
  };

  const previousPage = () => {
    if (canPreviousPage) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex - 1,
      }));
    }
  };

  const gotoPage = (pageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex,
    }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
      pageIndex: 0,
    }));
  };

  const setSortBy = (sortBy: Array<{ id: string; desc: boolean }>) => {
    setPagination((prev) => ({
      ...prev,
      sortBy,
      pageIndex: 0, // Reset to first page when sorting changes
    }));
  };

  if (error) {
    return (
      <Flex sx={{ flexDirection: "column", gap: 3 }}>
        {metadataError && <Error message={metadataError.message} />}
        {componentsError && <Error message={componentsError.message} />}
        {observationsError && <Error message={observationsError.message} />}
        {propError && <Error message={propError.message} />}
      </Flex>
    );
  } else if (
    fetching &&
    (!metadata || !dimensions || !measures || !observations)
  ) {
    return <Loading />;
  } else if (metadata && dimensions && measures && observations) {
    const title = metadata.map((d) => d.title).join(", ");

    return (
      <div
        className={classes.dataWrapper}
        data-chart-loaded={!chartLoadingState.loading}
      >
        {observations.length > 0 && (
          <A11yTable
            title={title}
            observations={observations}
            dimensions={dimensions}
            measures={measures}
          />
        )}

        {createElement(Component, {
          observations,
          dimensions,
          dimensionsById,
          measures,
          measuresById,
          chartConfig,
          embedParams,
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            canNextPage,
            canPreviousPage,
            totalCount,
            nextPage,
            previousPage,
            gotoPage,
            setPageSize,
            setSortBy,
          },
          ...ComponentProps,
        } as ChartProps<TChartConfig> & TOtherProps)}

        <AnimatePresence>
          {chartLoadingState.loading ? (
            <LoadingOverlayComponent />
          ) : observations.length === 0 ? (
            <NoDataHint />
          ) : null}
        </AnimatePresence>
      </div>
    );
  } else {
    return null;
  }
};

/**
 * Makes sure the TablePaginatedDataWrapper is re-rendered when the cube iris and/or joinBy change.
 * This ensures that data hooks do not keep stale data.
 */
export const TablePaginatedDataWrapper = (
  props: ComponentProps<typeof TablePaginatedDataWrapperInner>
) => {
  const key = useMemo(
    () =>
      props.chartConfig.cubes
        .map((c) => `${c.iri}${c.joinBy ? `:${c.joinBy}` : ""}`)
        .join(" / "),
    [props.chartConfig.cubes]
  );
  return <TablePaginatedDataWrapperInner key={key} {...props} />;
};

const Error = ({ message }: { message: string }) => {
  return (
    <Flex flexGrow={1} justifyContent="center" minHeight={300}>
      <LoadingDataError message={message} />
    </Flex>
  );
};
