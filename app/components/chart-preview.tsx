import { Trans } from "@lingui/macro";
import { Flex, Text } from "theme-ui";
import {
  ConfiguratorStateConfiguringChart,
  useConfiguratorState,
} from "../configurator";
import { useLocale } from "../locales/use-locale";
import { ChartAreasVisualization } from "../charts/area/chart-area";
import { ChartColumnsVisualization } from "../charts/column/chart-column";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "../charts/line/chart-lines";
import { ChartScatterplotVisualization } from "../charts/scatterplot/chart-scatterplot";
import { ChartPieVisualization } from "../charts/pie/chart-pie";
import { ChartBarsVisualization } from "../charts/bar/chart-bar";
import { ChartTableVisualization } from "../charts/table/chart-table";
import * as React from "react";
import { InteractiveDataFilters } from "../charts/shared/interactive-data-filters";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../charts/shared/use-interactive-filters";
import { useQueryFilters } from "../charts/shared/chart-helpers";

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
          <Text
            variant="heading2"
            sx={{
              mb: 2,
              color: state.meta.title[locale] === "" ? "monochrome500" : "text",
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
      )}
      <InteractiveFiltersProvider>
        <Chart state={state} />
      </InteractiveFiltersProvider>

      {state.state !== "INITIAL" && state.chartConfig && (
        <ChartFootnotes
          dataSetIri={dataSetIri}
          chartConfig={state.chartConfig}
        />
      )}
    </Flex>
  );
};

const Chart = ({ state }: { state: ConfiguratorStateConfiguringChart }) => {
  const { dataSet, chartConfig } = state;
  const { filters } = state.chartConfig;
  const [interactiveFiltersState] = useInteractiveFilters();

  const interactiveFiltersIsActive =
    chartConfig.chartType !== "table" &&
    chartConfig.interactiveFiltersConfig.dataFilters.active;

  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    filters,
    interactiveFiltersIsActive,
    interactiveDataFilters: interactiveFiltersState.dataFilters,
  });

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
      }}
    >
      {/* INTERACTIVE FILTERS */}
      {state.chartConfig.chartType !== "table" &&
        state.chartConfig.interactiveFiltersConfig.dataFilters.active && (
          <InteractiveDataFilters
            dataFiltersConfig={
              state.chartConfig.interactiveFiltersConfig.dataFilters
            }
          />
        )}
      {/* // FIXME: we shouldn't need this condition because the states must be these */}
      {state.chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
      {state.chartConfig.chartType === "bar" && (
        <ChartBarsVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
      {state.chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
          queryFilters={queryFilters}
        />
      )}
      {state.chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
      {state.chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
      {state.chartConfig.chartType === "pie" && (
        <ChartPieVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
      {state.chartConfig.chartType === "table" && (
        <ChartTableVisualization
          dataSetIri={dataSet}
          chartConfig={state.chartConfig}
        />
      )}
    </Flex>
  );
};
