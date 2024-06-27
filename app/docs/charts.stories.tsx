import { Meta } from "@storybook/react";
import keyBy from "lodash/keyBy";

import { Columns, ErrorWhiskers } from "@/charts/column/columns";
import { ColumnChart } from "@/charts/column/columns-state";
import { Scatterplot } from "@/charts/scatterplot/scatterplot";
import { ScatterplotChart } from "@/charts/scatterplot/scatterplot-state";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "@/charts/shared/axis-height-linear";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "@/charts/shared/axis-width-band";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "@/charts/shared/axis-width-linear";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { Dimension, Measure } from "@/domain/data";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";
import { CONFIGURATOR_STATE_VERSION } from "@/utils/chart-config/versioning";

import {
  chartConfig,
  columnDimensions,
  columnMeasures,
  columnObservations,
} from "./columns.mock";
import {
  chartConfig as scatterplotChartConfig,
  scatterplotDimensions,
  scatterplotFields,
  scatterplotMeasures,
  scatterplotObservations,
} from "./scatterplot.mock";

const meta: Meta = {
  title: "Charts / Charts",
};

export default meta;

const ColumnsStory = {
  title: "Charts / Columns",
  render: () => (
    <ConfiguratorStateProvider
      chartId="published"
      initialState={{
        version: CONFIGURATOR_STATE_VERSION,
        state: "PUBLISHED",
        dataSource: { type: "sparql", url: "" },
        layout: {
          type: "tab",
          meta: {
            title: { en: "", de: "", fr: "", it: "" },
            description: { en: "", de: "", fr: "", it: "" },
          },
          activeField: undefined,
        },
        chartConfigs: [chartConfig],
        activeChartKey: "scatterplot",
        dashboardFilters: { timeRangeFilters: [] },
      }}
    >
      <InteractiveFiltersProvider chartConfigs={[chartConfig]}>
        <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
          <ColumnChart
            observations={columnObservations}
            measures={columnMeasures}
            measuresByIri={keyBy(columnMeasures, (d: Measure) => d.iri)}
            dimensions={columnDimensions}
            dimensionsByIri={keyBy(columnDimensions, (d: Dimension) => d.iri)}
            chartConfig={chartConfig}
          >
            <ChartContainer type="column">
              <ChartSvg>
                <AxisHeightLinear />
                <AxisWidthBand />
                <AxisWidthBandDomain />
                <Columns />
                <ErrorWhiskers />
              </ChartSvg>
              <Tooltip type="single" />
            </ChartContainer>
          </ColumnChart>
        </InteractiveFiltersChartProvider>
      </InteractiveFiltersProvider>
    </ConfiguratorStateProvider>
  ),
};

export { ColumnsStory as Columns, ScatterplotStory as Scatterplot };

const ScatterplotStory = {
  render: () => (
    <ConfiguratorStateProvider
      chartId="published"
      initialState={{
        version: CONFIGURATOR_STATE_VERSION,
        state: "PUBLISHED",
        dataSource: { type: "sparql", url: "" },
        layout: {
          type: "tab",
          meta: {
            title: { en: "", de: "", fr: "", it: "" },
            description: { en: "", de: "", fr: "", it: "" },
          },
          activeField: undefined,
        },
        chartConfigs: [chartConfig],
        activeChartKey: "scatterplot",
        dashboardFilters: { timeRangeFilters: [] },
      }}
    >
      <InteractiveFiltersProvider chartConfigs={[chartConfig]}>
        <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
          <ScatterplotChart
            observations={scatterplotObservations}
            dimensions={scatterplotDimensions}
            dimensionsByIri={keyBy(scatterplotDimensions, (d) => d.iri)}
            measures={scatterplotMeasures}
            measuresByIri={keyBy(scatterplotMeasures, (d) => d.iri)}
            chartConfig={scatterplotChartConfig}
          >
            <ChartContainer type="scatterplot">
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
            {scatterplotFields.segment && (
              <LegendColor
                chartConfig={chartConfig}
                symbol="square"
                interactive
              />
            )}
          </ScatterplotChart>
        </InteractiveFiltersChartProvider>
      </InteractiveFiltersProvider>
    </ConfiguratorStateProvider>
  ),
};
