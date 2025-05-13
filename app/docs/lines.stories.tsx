import { Meta } from "@storybook/react";
import keyBy from "lodash/keyBy";

import { Lines } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { LegendColor } from "@/charts/shared/legend-color";
import { Observer } from "@/charts/shared/use-size";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";
import { CONFIGURATOR_STATE_VERSION } from "@/utils/chart-config/constants";

import {
  chartConfig,
  dimensions,
  fields,
  measures,
  observations,
} from "./lines.mock";

const meta: Meta = {
  title: "Charts / Charts / Line",
};

export default meta;

const LineChartStory = () => (
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
        blocks: [{ type: "chart", key: chartConfig.key, initialized: false }],
        activeField: undefined,
      },
      chartConfigs: [chartConfig],
      activeChartKey: chartConfig.key,
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
        <Observer>
          <LineChart
            limits={{
              axisDimension: undefined,
              limitMeasure: undefined,
              limits: [],
            }}
            observations={observations}
            dimensions={dimensions}
            dimensionsById={keyBy(dimensions, (d) => d.id)}
            measures={measures}
            measuresById={keyBy(measures, (d) => d.id)}
            chartConfig={chartConfig}
          >
            <ChartContainer>
              <ChartSvg>
                <BrushTime />
                <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
                <Lines />
              </ChartSvg>
            </ChartContainer>

            {fields.segment && (
              <LegendColor
                chartConfig={chartConfig}
                symbol="line"
                interactive
                showTitle
              />
            )}
          </LineChart>
        </Observer>
      </InteractiveFiltersChartProvider>
    </InteractiveFiltersProvider>
  </ConfiguratorStateProvider>
);

export { LineChartStory as Line };
