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
import { CONFIGURATOR_STATE_VERSION } from "@/utils/chart-config/constants";

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
            label: { en: "", de: "", fr: "", it: "" },
          },
          activeField: undefined,
        },
        chartConfigs: [chartConfig],
        activeChartKey: "scatterplot",
        dashboardFilters: {
          timeRange: {
            active: false,
            timeUnit: "",
            presets: {
              from: "",
              to: "",
            },
          },
          dataFilters: {
            componentIds: [],
            filters: {},
          },
        },
      }}
    >
      <InteractiveFiltersProvider chartConfigs={[chartConfig]}>
        <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
          <ColumnChart
            observations={columnObservations}
            measures={columnMeasures}
            measuresById={keyBy(columnMeasures, (d: Measure) => d.id)}
            dimensions={columnDimensions}
            dimensionsById={keyBy(columnDimensions, (d: Dimension) => d.id)}
            chartConfig={chartConfig}
          >
            <ChartContainer>
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
            label: { en: "", de: "", fr: "", it: "" },
          },
          activeField: undefined,
        },
        chartConfigs: [chartConfig],
        activeChartKey: "scatterplot",
        dashboardFilters: {
          timeRange: {
            active: false,
            timeUnit: "",
            presets: {
              from: "",
              to: "",
            },
          },
          dataFilters: {
            componentIds: [],
            filters: {},
          },
        },
      }}
    >
      <InteractiveFiltersProvider chartConfigs={[chartConfig]}>
        <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
          <ScatterplotChart
            observations={scatterplotObservations}
            dimensions={scatterplotDimensions}
            dimensionsById={keyBy(scatterplotDimensions, (d) => d.id)}
            measures={scatterplotMeasures}
            measuresById={keyBy(scatterplotMeasures, (d) => d.id)}
            chartConfig={scatterplotChartConfig}
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
