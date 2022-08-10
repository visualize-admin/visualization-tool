import { Box } from "@mui/material";
import React, { memo } from "react";

import { Lines } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
import { A11yTable } from "@/charts/shared/a11y-table";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
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
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
  LineConfig,
  LineFields,
} from "@/configurator";
import { isNumber } from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { DataSource } from "@/graphql/resolvers/utils";
import { useLocale } from "@/locales/use-locale";

export const ChartLinesVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: LineConfig;
  queryFilters: Filters | FilterValueSingle;
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
          fields={chartConfig.fields}
        />
        <ChartLines
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
  } else if (observations && !observations.map((obs) => obs.y).some(isNumber)) {
    return <NoDataHint />;
  } else if (error) {
    return <LoadingDataError />;
  } else {
    return <Loading />;
  }
};

export const ChartLines = memo(function ChartLines({
  observations,
  dimensions,
  measures,
  fields,
  interactiveFiltersConfig,
}: {
  observations: Observation[];
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
  fields: LineFields;
  interactiveFiltersConfig: InteractiveFiltersConfig;
}) {
  return (
    <LineChart
      data={observations}
      fields={fields}
      dimensions={dimensions}
      measures={measures}
      interactiveFiltersConfig={interactiveFiltersConfig}
      aspectRatio={0.4}
    >
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
          <Lines />
          {/* <HoverLine /> <HoverLineValues /> */}
          <InteractionHorizontal />
          {interactiveFiltersConfig?.time.active && <BrushTime />}
        </ChartSvg>

        <Ruler />

        <HoverDotMultiple />

        {/* <HoverDot /> */}

        <Tooltip type={fields.segment ? "multiple" : "single"} />
      </ChartContainer>

      {fields.segment && interactiveFiltersConfig?.legend.active ? (
        <InteractiveLegendColor />
      ) : fields.segment ? (
        <LegendColor symbol="line" />
      ) : null}
    </LineChart>
  );
});
