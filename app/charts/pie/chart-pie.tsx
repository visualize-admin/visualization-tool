import { Box } from "@mui/material";
import { memo } from "react";

import { Pie } from "@/charts/pie/pie";
import { PieChart } from "@/charts/pie/pie-state";
import { A11yTable } from "@/charts/shared/a11y-table";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
  OnlyNegativeDataHint,
} from "@/components/hint";
import {
  DataSource,
  PieConfig,
  QueryFilters,
} from "@/configurator/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartPieVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: PieConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
      filters: queryFilters,
    },
  });

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
        <ChartPie
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          chartConfig={chartConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (error) {
    return <LoadingDataError />;
  } else {
    return <Loading />;
  }
};

export const ChartPie = memo(
  ({
    observations,
    dimensions,
    measures,
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    chartConfig: PieConfig;
  }) => {
    const { fields } = chartConfig;
    const somePositive = observations.some(
      (d) => d[fields?.y?.componentIri]! > 0
    );

    if (!somePositive) {
      return <OnlyNegativeDataHint />;
    }

    const { interactiveFiltersConfig } = chartConfig;
    return (
      <PieChart
        data={observations}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
        aspectRatio={0.5}
      >
        <ChartContainer>
          <ChartSvg>
            <Pie />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        <LegendColor
          symbol="square"
          interactive={
            fields.segment && interactiveFiltersConfig?.legend.active === true
          }
        />

        {interactiveFiltersConfig?.timeSlider.componentIri && (
          <TimeSlider
            componentIri={interactiveFiltersConfig.timeSlider.componentIri}
            dimensions={dimensions}
          />
        )}
      </PieChart>
    );
  }
);
