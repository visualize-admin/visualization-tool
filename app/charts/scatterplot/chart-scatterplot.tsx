import React, { memo } from "react";
import { Box } from "theme-ui";
import { Loading, LoadingOverlay } from "../../components/hint";
import {
  Filters,
  FilterValueSingle,
  InteractiveFiltersConfig,
  ScatterPlotConfig,
  ScatterPlotFields,
} from "../../configurator";
import { Observation } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { A11yTable } from "../shared/a11y-table";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "../shared/axis-height-linear";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "../shared/axis-width-linear";
import { ChartContainer, ChartSvg } from "../shared/containers";
import { Tooltip } from "../shared/interaction/tooltip";
import { InteractiveLegendColor, LegendColor } from "../shared/legend-color";
import { InteractionVoronoi } from "../shared/overlay-voronoi";
import { useChartData } from "../shared/use-chart-data";
import { Scatterplot } from "./scatterplot-simple";
import { ScatterplotChart } from "./scatterplot-state";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: ScatterPlotConfig;
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
        <ChartScatterplot
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

export const ChartScatterplot = memo(
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
    fields: ScatterPlotFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <ScatterplotChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
        aspectRatio={1}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear />
            <AxisHeightLinear />
            <AxisWidthLinearDomain />
            <AxisHeightLinearDomain />
            <Scatterplot />
            <InteractionVoronoi />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        {fields.segment && interactiveFiltersConfig?.legend.active === true ? (
          <InteractiveLegendColor />
        ) : fields.segment ? (
          <LegendColor symbol="line" />
        ) : null}{" "}
      </ScatterplotChart>
    );
  }
);
