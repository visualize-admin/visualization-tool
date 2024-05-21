import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { AnimatePresence } from "framer-motion";
import keyBy from "lodash/keyBy";
import React, { createElement, useEffect, useMemo } from "react";

import { A11yTable } from "@/charts/shared/a11y-table";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
import { ChartProps } from "@/charts/shared/ChartProps";
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
import { useLocale } from "@/src";

type ElementProps<RE> = RE extends React.ElementType<infer P> ? P : never;

const useStyles = makeStyles((theme: Theme) => ({
  dataWrapper: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
}));

/**
 * Responsible for fetching the data for the chart.
 * - Provides observations, dimensions and measures to the chart Component
 * - Handles loading & error state
 */
export const ChartDataWrapper = <
  TChartConfig extends ChartConfig,
  TOtherProps,
  TChartComponent extends React.ElementType,
>({
  chartConfig,
  LoadingOverlayComponent = LoadingOverlay,
  Component,
  ComponentProps,
  componentIris,
  dataSource,
  observationQueryFilters,
  fetching: fetchingProp = false,
  error: propError,
}: {
  chartConfig: TChartConfig;
  LoadingOverlayComponent?: React.ElementType;
  Component: TChartComponent;
  ComponentProps?: Omit<
    ElementProps<TChartComponent>,
    keyof ChartProps<TChartConfig>
  >;
  componentIris?: string[];
  dataSource: DataSource;
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
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
    keepPreviousData: true,
  });
  const [observationsQuery] = useDataCubesObservationsQuery({
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

  const { dimensionsByIri, measuresByIri } = useMemo(() => {
    return {
      dimensionsByIri: keyBy(dimensions ?? [], (d) => d.iri),
      measuresByIri: keyBy(measures ?? [], (d) => d.iri),
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
          dimensionsByIri,
          measures,
          measuresByIri,
          chartConfig,
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

const Error = ({ message }: { message: string }) => {
  return (
    <Flex flexGrow={1} justifyContent="center" minHeight={300}>
      <LoadingDataError message={message} />
    </Flex>
  );
};
