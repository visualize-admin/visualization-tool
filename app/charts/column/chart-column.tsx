import React, { memo } from "react";
import { Box } from "theme-ui";
import {
  ColumnConfig,
  ColumnFields,
  InteractiveFiltersConfig,
} from "../../configurator";
import { Observation } from "../../domain/data";
import { isNumber } from "../../configurator/components/ui-helpers";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { Tooltip } from "../shared/interaction/tooltip";
import { AxisWidthBand, AxisWidthBandDomain } from "../shared/axis-width-band";
import { AxisHeightLinear } from "../shared/axis-height-linear";
import { ColumnsGrouped } from "./columns-grouped";
import { GroupedColumnChart } from "./columns-grouped-state";
import { Columns } from "./columns-simple";
import { ColumnsStacked } from "./columns-stacked";
import { StackedColumnsChart } from "./columns-stacked-state";
import { ColumnChart } from "./columns-state";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractionColumns } from "./overlay-columns";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";
import { BrushTime } from "../shared/brush";

export const ChartColumnsVisualization = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ColumnConfig;
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [chartConfig.fields.y.componentIri], // FIXME: Other fields may also be measures
      filters: chartConfig.filters,
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
          interactiveFilters={chartConfig.interactiveFilters}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    ) : (
      <NoDataHint />
    );
  } else if (observations && !observations.map((obs) => obs.y).some(isNumber)) {
    return <NoDataHint />;
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
    interactiveFilters,
  }: {
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    interactiveFilters: InteractiveFiltersConfig;
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
            interactiveFiltersConfig={interactiveFilters}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <ColumnsStacked /> <AxisWidthBandDomain />
                <InteractionColumns />
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>
            {fields.segment && interactiveFilters.legend.active ? (
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
            interactiveFiltersConfig={interactiveFilters}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <ColumnsGrouped /> <AxisWidthBandDomain />
                <InteractionColumns />
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>

            {fields.segment && interactiveFilters.legend.active ? (
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
            interactiveFiltersConfig={interactiveFilters}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <Columns /> <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFilters.time.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="single" />
            </ChartContainer>
          </ColumnChart>
        )}
      </>
    );
  }
);
