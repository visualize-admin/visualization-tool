import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  Loading,
  LoadingDataError,
  LoadingOverlay,
  NoDataHint,
} from "../../components/hint";
import {
  ColumnConfig,
  ColumnFields,
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
} from "../../configurator";
import { isNumber } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import {
  DimensionFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { AxisWidthBand, AxisWidthBandDomain } from "../shared/axis-width-band";
import { BrushTime } from "../shared/brush";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { Tooltip } from "../shared/interaction/tooltip";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { ColumnsGrouped } from "./columns-grouped";
import { GroupedColumnChart } from "./columns-grouped-state";
import { Columns } from "./columns-simple";
import { ColumnsStacked } from "./columns-stacked";
import { StackedColumnsChart } from "./columns-stacked-state";
import { ColumnChart } from "./columns-state";
import { InteractionColumns } from "./overlay-columns";

export const ChartColumnsVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: ColumnConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const locale = useLocale();
  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
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
    dimensions: DimensionFieldsFragment[];
    measures: DimensionFieldsFragment[];
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
              <InteractiveLegendColor symbol="line" />
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
                <AxisHeightLinear /> <AxisWidthBand />
                <ColumnsGrouped /> <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFiltersConfig?.time.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>

            {fields.segment && interactiveFiltersConfig?.legend.active ? (
              <InteractiveLegendColor symbol="line" />
            ) : fields.segment ? (
              <LegendColor symbol="line" />
            ) : null}
          </GroupedColumnChart>
        ) : (
          <ColumnChart
            data={observations}
            fields={fields}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <Columns /> <AxisWidthBandDomain />
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
