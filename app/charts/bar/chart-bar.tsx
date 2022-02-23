import React, { memo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay } from "../../components/hint";
import {
  BarConfig,
  BarFields,
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
} from "../../configurator";
import { Observation } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import { AxisWidthLinear } from "../shared/axis-width-linear";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { useChartData } from "../shared/use-chart-data";
import { BarsGrouped } from "./bars-grouped";
import { GroupedBarsChart } from "./bars-grouped-state";
import { Bars } from "./bars-simple";
import { BarChart } from "./bars-state";

export const ChartBarsVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: BarConfig;
  queryFilters: Filters | FilterValueSingle;
}) => {
  const locale = useLocale();
  const { data, fetching } = useChartData({
    locale,
    iri: dataSetIri,
    filters: queryFilters,
  });

  if (data?.dataCubeByIri) {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;
    return (
      <Box data-chart-loaded={!fetching} sx={{ position: "relative" }}>
        <A11yTable
          title={title}
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
        />
        <ChartBars
          observations={observations.data}
          dimensions={dimensions}
          measures={measures}
          fields={chartConfig.fields}
          interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
        />
        {fetching && <LoadingOverlay />}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

export const ChartBars = memo(
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
    fields: BarFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <>
        {fields.segment?.componentIri ? (
          <GroupedBarsChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
          >
            <ChartContainer>
              <ChartSvg>
                <BarsGrouped />
                <AxisWidthLinear />
              </ChartSvg>
            </ChartContainer>
            {fields.segment &&
            interactiveFiltersConfig?.legend.active === true ? (
              <InteractiveLegendColor />
            ) : fields.segment ? (
              <LegendColor symbol="line" />
            ) : null}
          </GroupedBarsChart>
        ) : (
          <BarChart data={observations} fields={fields} measures={measures}>
            <ChartContainer>
              <ChartSvg>
                <Bars />
                <AxisWidthLinear />
              </ChartSvg>
            </ChartContainer>
          </BarChart>
        )}
      </>
    );
  }
);
