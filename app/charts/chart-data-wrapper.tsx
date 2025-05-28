import { makeStyles } from "@mui/styles";
import { AnimatePresence } from "framer-motion";
import keyBy from "lodash/keyBy";
import {
  ComponentProps,
  createElement,
  ElementType,
  useEffect,
  useMemo,
} from "react";

import { A11yTable } from "@/charts/shared/a11y-table";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import { ChartProps } from "@/charts/shared/chart-props";
import { EmbedQueryParams } from "@/components/embed-params";
import Flex from "@/components/flex";
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
  useDataCubesObservationsQuery,
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

/**
 * Responsible for fetching the data for the chart.
 * - Provides observations, dimensions and measures to the chart Component
 * - Handles loading & error state
 */
const ChartDataWrapperInner = <
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
  /* Use this if extra data is loaded and the possible error must be shown by ChartDataWrapper*/
  error?: Error;
}) => {
  const chartLoadingState = useLoadingState();
  const classes = useStyles();

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
  const [observationsQuery] = useDataCubesObservationsQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: observationQueryFilters,
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
    data: observationsData,
    fetching: fetchingObservations,
    error: observationsError,
  } = observationsQuery;

  const metadata = metadataData?.dataCubesMetadata;
  const observations = observationsData?.dataCubesObservations?.data;
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
    // FIXME: adapt to design
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
 * Makes sure the ChartDataWrapper is re-rendered when the cube iris and/or joinBy change.
 * This ensures that data hooks do not keep stale data.
 */
export const ChartDataWrapper = (
  props: ComponentProps<typeof ChartDataWrapperInner>
) => {
  const key = useMemo(
    () =>
      props.chartConfig.cubes
        .map((c) => `${c.iri}${c.joinBy ? `:${c.joinBy}` : ""}`)
        .join(" / "),
    [props.chartConfig.cubes]
  );
  return <ChartDataWrapperInner key={key} {...props} />;
};

const Error = ({ message }: { message: string }) => {
  return (
    <Flex flexGrow={1} justifyContent="center" minHeight={300}>
      <LoadingDataError message={message} />
    </Flex>
  );
};
