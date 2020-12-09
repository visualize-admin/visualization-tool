import { Trans } from "@lingui/macro";
import * as React from "react";
import { useEffect } from "react";
import { Flex, Text } from "theme-ui";
import { ChartAreasVisualization } from "../charts/area/chart-area";
import { ChartBarsVisualization } from "../charts/bar/chart-bar";
import { ChartColumnsVisualization } from "../charts/column/chart-column";
import { ChartLinesVisualization } from "../charts/line/chart-lines";
import { ChartPieVisualization } from "../charts/pie/chart-pie";
import { ChartScatterplotVisualization } from "../charts/scatterplot/chart-scatterplot";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { InteractiveDataFilters } from "../charts/shared/interactive-data-filters";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../charts/shared/use-interactive-filters";
import { ChartTableVisualization } from "../charts/table/chart-table";
import { ChartConfig, useConfiguratorState } from "../configurator";
import { useLocale } from "../locales/use-locale";
import { ChartFootnotes } from "./chart-footnotes";

export const ChartPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const [state] = useConfiguratorState();
  const locale = useLocale();

  return (
    <Flex
      p={5}
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "monochrome800",
      }}
    >
      {(state.state === "SELECTING_CHART_TYPE" ||
        state.state === "CONFIGURING_CHART" ||
        state.state === "DESCRIBING_CHART" ||
        state.state === "PUBLISHING") && (
        <>
          <>
            <Text
              variant="heading2"
              sx={{
                mb: 2,
                color:
                  state.meta.title[locale] === "" ? "monochrome500" : "text",
              }}
            >
              {state.meta.title[locale] === "" ? (
                <Trans id="annotation.add.title">
                  [You can add a title here]
                </Trans> // dataSet.label.value
              ) : (
                state.meta.title[locale]
              )}
            </Text>
            <Text
              variant="paragraph1"
              sx={{
                mb: 2,
                color:
                  state.meta.description[locale] === ""
                    ? "monochrome500"
                    : "text",
              }}
            >
              {state.meta.description[locale] === "" ? (
                <Trans id="annotation.add.description">
                  [You can add a description here]
                </Trans>
              ) : (
                state.meta.description[locale]
              )}
            </Text>
          </>
          <InteractiveFiltersProvider>
            <ChartWithFilters
              dataSet={state.dataSet}
              chartConfig={state.chartConfig}
            />
            {state.chartConfig && (
              <ChartFootnotes
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
          </InteractiveFiltersProvider>
        </>
      )}
    </Flex>
  );
};
const ChartWithFilters = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  const [, dispatch] = useInteractiveFilters();
  // Reset Filters if chart type changes
  useEffect(() => {
    dispatch({
      type: "RESET_DATA_FILTER",
    });
  }, [chartConfig.chartType]);

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
          queryFilters={queryFilters}
        />
      )}
      {chartConfig.chartType === "bar" && (
        <ChartBarsVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
          queryFilters={queryFilters}
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
          queryFilters={queryFilters}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
          queryFilters={queryFilters}
        />
      )}
      {chartConfig.chartType === "pie" && (
        <ChartPieVisualization
          dataSetIri={dataSet}
          chartConfig={chartConfig}
          queryFilters={queryFilters}
        />
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
