import * as React from "react";
import { Flex, Text } from "theme-ui";
import { ChartAreasVisualization } from "../charts/area/chart-area";
import { ChartBarsVisualization } from "../charts/bar/chart-bar";
import { ChartColumnsVisualization } from "../charts/column/chart-column";
import { ChartLinesVisualization } from "../charts/line/chart-lines";
import { ChartPieVisualization } from "../charts/pie/chart-pie";
import { ChartScatterplotVisualization } from "../charts/scatterplot/chart-scatterplot";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { InteractiveDataFilters } from "../charts/shared/interactive-data-filters";
import { InteractiveFiltersProvider } from "../charts/shared/use-interactive-filters";
import { ChartTableVisualization } from "../charts/table/chart-table";
import { ChartConfig, Meta } from "../configurator";
import { useLocale } from "../locales/use-locale";
import { ChartFootnotes } from "./chart-footnotes";

export const ChartPublished = ({
  dataSet,
  meta,
  chartConfig,
  configKey,
}: {
  dataSet: string;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
}) => {
  const locale = useLocale();

  return (
    <>
      <Flex
        p={5}
        sx={{
          flexGrow: 1,
          color: "monochrome800",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {meta.title[locale] !== "" && (
          <Text variant="heading2" mb={2}>
            {meta.title[locale]}
          </Text>
        )}
        {meta.description[locale] && (
          <Text variant="paragraph1" mb={2}>
            {meta.description[locale]}
          </Text>
        )}
        <InteractiveFiltersProvider>
          <ChartWithFilters dataSet={dataSet} chartConfig={chartConfig} />
          {chartConfig && (
            <ChartFootnotes
              dataSetIri={dataSet}
              chartConfig={chartConfig}
              configKey={configKey}
            />
          )}
        </InteractiveFiltersProvider>
      </Flex>
    </>
  );
};

const ChartWithFilters = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
      }}
    >
      {/* INTERACTIVE FILTERS */}
      {chartConfig.chartType !== "table" &&
        chartConfig.interactiveFiltersConfig.dataFilters.active && (
          <InteractiveDataFilters
            dataSet={dataSet}
            dataFiltersConfig={chartConfig.interactiveFiltersConfig.dataFilters}
            chartConfig={chartConfig}
          />
        )}
      <Chart dataSet={dataSet} chartConfig={chartConfig} />
    </Flex>
  );
};

const Chart = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  const interactiveFiltersIsActive =
    chartConfig.chartType !== "table" &&
    chartConfig.interactiveFiltersConfig.dataFilters.active;

  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
    interactiveFiltersIsActive,
  });

  return (
    <>
      {/* CHARTS */}
      {chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "bar" && (
        <ChartBarsVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
          queryFilters={queryFilters}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "pie" && (
        <ChartPieVisualization dataSetIri={dataSet} chartConfig={chartConfig} />
      )}
      {chartConfig.chartType === "table" && (
        <ChartTableVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
        />
      )}
    </>
  );
};
