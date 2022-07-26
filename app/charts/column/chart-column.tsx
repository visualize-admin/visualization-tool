import { Box } from "@mui/material";
import React, { memo } from "react";

import {
  ColumnsGrouped,
  ErrorWhiskers as ErrorWhiskersGrouped,
} from "@/charts/column/columns-grouped";
import { GroupedColumnChart } from "@/charts/column/columns-grouped-state";
import { Columns, ErrorWhiskers } from "@/charts/column/columns-simple";
import { ColumnsStacked } from "@/charts/column/columns-stacked";
import { StackedColumnsChart } from "@/charts/column/columns-stacked-state";
import { ColumnChart } from "@/charts/column/columns-state";
import { InteractionColumns } from "@/charts/column/overlay-columns";
import { A11yTable } from "@/charts/shared/a11y-table";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "@/charts/shared/axis-width-band";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import {
  InteractiveLegendColor,
  LegendColor,
} from "@/charts/shared/legend-color";
import { useDataSource } from "@/components/data-source-menu";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "@/components/hint";
import {
  ColumnConfig,
  ColumnFields,
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
} from "@/configurator";
import { isNumber } from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartColumnsVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: ColumnConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const [dataSource] = useDataSource();
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
        <ChartColumns
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

export const ChartColumns = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    interactiveFiltersConfig: InteractiveFiltersConfig;
    fields: ColumnFields;
  }) => {
    return (
      <>
        {/* FIXME: These checks should probably be handled somewhere else */}
        {fields.segment?.componentIri && fields.segment.type === "stacked" ? (
          <StackedColumnsChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <ColumnsStacked /> <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFiltersConfig?.time.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>
            {fields.segment && interactiveFiltersConfig?.legend.active ? (
              <InteractiveLegendColor />
            ) : fields.segment ? (
              <LegendColor symbol="line" />
            ) : null}
          </StackedColumnsChart>
        ) : fields.segment?.componentIri &&
          fields.segment.type === "grouped" ? (
          <GroupedColumnChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear />
                <AxisWidthBand />
                <ColumnsGrouped />
                <ErrorWhiskersGrouped />
                <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFiltersConfig?.time.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>

            {fields.segment && interactiveFiltersConfig?.legend.active ? (
              <InteractiveLegendColor />
            ) : fields.segment ? (
              <LegendColor symbol="line" />
            ) : null}
          </GroupedColumnChart>
        ) : (
          <ColumnChart
            data={observations}
            fields={fields}
            measures={measures}
            dimensions={dimensions}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear />
                <AxisWidthBand />
                <Columns />
                <ErrorWhiskers />
                <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFiltersConfig?.time.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="single" />
            </ChartContainer>
          </ColumnChart>
        )}
      </>
    );
  }
);
