import { Box } from "@mui/material";
import React from "react";
import { UseQueryResponse } from "urql";

import { ChartProps } from "@/charts/shared/ChartProps";
import { A11yTable } from "@/charts/shared/a11y-table";
import Flex from "@/components/flex";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import { ChartConfig } from "@/configurator";
import {
  ComponentsQuery,
  DataCubeMetadataQuery,
  DataCubeObservationsQuery,
} from "@/graphql/query-hooks";

type ElementProps<RE> = RE extends React.ElementType<infer P> ? P : never;

export const ChartLoadingWrapper = <
  TChartConfig extends ChartConfig,
  TOtherProps,
  TChartComponent extends React.ElementType
>({
  metadataQuery,
  componentsQuery,
  observationsQuery,
  chartConfig,
  Component,
  ComponentProps,
}: {
  metadataQuery: Pick<
    UseQueryResponse<DataCubeMetadataQuery>[0],
    "data" | "fetching" | "error"
  >;
  componentsQuery: Pick<
    UseQueryResponse<ComponentsQuery>[0],
    "data" | "fetching" | "error"
  >;
  observationsQuery: Pick<
    UseQueryResponse<DataCubeObservationsQuery>[0],
    "data" | "fetching" | "error"
  >;
  chartConfig: TChartConfig;
  Component: TChartComponent;
  ComponentProps?: Omit<
    ElementProps<TChartComponent>,
    keyof ChartProps<TChartConfig>
  >;
}) => {
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

  const metadata = metadataData?.dataCubeByIri;
  const observations = observationsData?.dataCubeByIri?.observations.data;
  const dimensions = componentsData?.dataCubeByIri?.dimensions;
  const measures = componentsData?.dataCubeByIri?.measures;

  if (metadata && dimensions && measures && observations) {
    const { title } = metadata;

    return observations.length > 0 ? (
      <Box
        data-chart-loaded={
          !(fetchingMetadata && fetchingComponents && fetchingObservations)
        }
        sx={{ position: "relative" }}
      >
        <A11yTable
          title={title}
          observations={observations}
          dimensions={dimensions}
          measures={measures}
        />
        {React.createElement(Component, {
          observations,
          dimensions,
          measures,
          chartConfig,
          ...ComponentProps,
        } as ChartProps<TChartConfig> & TOtherProps)}
        {(fetchingMetadata || fetchingComponents || fetchingObservations) && (
          <LoadingOverlay />
        )}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (metadataError || componentsError || observationsError) {
    return (
      <Flex sx={{ flexDirection: "column", gap: 3 }}>
        {metadataError && <Error message={metadataError.message} />}
        {componentsError && <Error message={componentsError.message} />}
        {observationsError && <Error message={observationsError.message} />}
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

const Error = ({ message }: { message: string }) => {
  return (
    <Flex flexGrow={1} justifyContent="center" minHeight={300}>
      <LoadingDataError message={message} />
    </Flex>
  );
};
