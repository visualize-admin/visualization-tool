import { Box } from "@mui/material";
import React, { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { A11yTable } from "@/charts/shared/a11y-table";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { QueryFilters } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import {
  InteractiveLegendColor,
  LegendColor,
} from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import {
  AreaConfig,
  AreaFields,
  DataSource,
  InteractiveFiltersConfig,
} from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartAreasVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: AreaConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
      filters: queryFilters,
    },
  });

  const observations = data?.dataCubeByIri?.observations.data;

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
        <ChartAreas
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
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

export const ChartAreas = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    fields: AreaFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <AreaChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime /> <AxisHeightLinear />
            <Areas /> <AxisTimeDomain />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.time.active === true && <BrushTime />}
          </ChartSvg>
          <Tooltip type={fields.segment ? "multiple" : "single"} />
          <Ruler />
        </ChartContainer>
        {fields.segment && interactiveFiltersConfig?.legend.active === true ? (
          <InteractiveLegendColor />
        ) : fields.segment ? (
          <LegendColor symbol="square" />
        ) : null}
      </AreaChart>
    );
  }
);
