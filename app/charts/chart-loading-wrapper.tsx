import { Box } from "@mui/material";
import React from "react";
import { UseQueryResponse } from "urql";

import { A11yTable } from "@/charts/shared/a11y-table";
import Flex from "@/components/flex";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import { ChartConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DataCubeObservationsQuery,
  DimensionMetadataFragment,
} from "@/graphql/query-hooks";

type ChartCommonProps<TChartConfig extends ChartConfig> = {
  fields: TChartConfig["fields"];
  observations: Observation[];
  measures: DimensionMetadataFragment[];
  dimensions: DimensionMetadataFragment[];
  chartConfig: TChartConfig;
};

type ElementProps<RE> = RE extends React.ElementType<infer P> ? P : never;

export const ChartLoadingWrapper = <
  TChartConfig extends ChartConfig,
  TOtherProps,
  TChartComponent extends React.ElementType
>({
  query,
  chartConfig,
  Component,
  ComponentProps,
}: {
  query: Pick<
    UseQueryResponse<DataCubeObservationsQuery>[0],
    "data" | "fetching" | "error"
  >;
  chartConfig: TChartConfig;
  Component: TChartComponent;
  ComponentProps?: Omit<
    ElementProps<TChartComponent>,
    keyof ChartCommonProps<TChartConfig>
  >;
}) => {
  const { data, fetching, error } = query;
  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return observations.data.length > 0 ? (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
        />
        {React.createElement(Component, {
          observations: observations.data,
          dimensions: dimensions,
          measures: measures,
          chartConfig: chartConfig,
          ...ComponentProps,
        } as ChartCommonProps<TChartConfig> & TOtherProps)}
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (error) {
    return (
      <Flex flexGrow={1} justifyContent="center" minHeight={300}>
        <LoadingDataError message={error.message} />
      </Flex>
    );
  } else {
    return (
      <Flex flexGrow={1} justifyContent="center" minHeight={300}>
        <Loading />
      </Flex>
    );
  }
};
