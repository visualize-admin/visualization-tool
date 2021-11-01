import { Trans } from "@lingui/macro";
import { omitBy } from "lodash";
import * as React from "react";
import { useEffect } from "react";
import { Box, Flex, Text } from "theme-ui";
import { ChartAreasVisualization } from "../charts/area/chart-area";
import { ChartBarsVisualization } from "../charts/bar/chart-bar";
import { ChartColumnsVisualization } from "../charts/column/chart-column";
import { ChartLinesVisualization } from "../charts/line/chart-lines";
import { ChartPieVisualization } from "../charts/pie/chart-pie";
import { ChartScatterplotVisualization } from "../charts/scatterplot/chart-scatterplot";
import { ChartDataFilters } from "../charts/shared/chart-data-filters";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../charts/shared/use-interactive-filters";
import { ChartTableVisualization } from "../charts/table/chart-table";
import { ChartConfig, Meta } from "../configurator";
import { parseDate } from "../configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "../configurator/constants";
import { useDataCubeMetadataQuery } from "../graphql/query-hooks";
import { DataCubePublicationStatus } from "../graphql/resolver-types";
import { useLocale } from "../locales/use-locale";
import { ChartErrorBoundary } from "./chart-error-boundary";
import { ChartFootnotes } from "./chart-footnotes";
import { HintRed } from "./hint";

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
  const [{ data: metaData }] = useDataCubeMetadataQuery({
    variables: { iri: dataSet, locale },
  });
  return (
    <Flex
      p={5}
      sx={{
        flexGrow: 1,
        color: "monochrome800",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <ChartErrorBoundary resetKeys={[chartConfig]}>
        {metaData?.dataCubeByIri?.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintRed iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintRed>
          </Box>
        )}
        {metaData?.dataCubeByIri?.expires && (
          <Box sx={{ mb: 4 }}>
            <HintRed iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.expires.warning">
                Careful, the data for this chart has expired.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintRed>
          </Box>
        )}
        {meta.title[locale] !== "" && (
          <Text as="div" variant="heading2" mb={2}>
            {meta.title[locale]}
          </Text>
        )}
        {meta.description[locale] && (
          <Text as="div" variant="paragraph1" mb={2}>
            {meta.description[locale]}
          </Text>
        )}
        <InteractiveFiltersProvider>
          <ChartWithInteractiveFilters
            dataSet={dataSet}
            chartConfig={chartConfig}
          />
          {chartConfig && (
            <ChartFootnotes
              dataSetIri={dataSet}
              chartConfig={chartConfig}
              configKey={configKey}
            />
          )}
        </InteractiveFiltersProvider>
      </ChartErrorBoundary>
    </Flex>
  );
};

const ChartWithInteractiveFilters = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  const [IFstate, dispatch] = useInteractiveFilters();
  const { interactiveFiltersConfig } = chartConfig;

  const presetFrom =
    interactiveFiltersConfig?.time.presets.from &&
    parseDate(interactiveFiltersConfig?.time.presets.from.toString());
  const presetTo =
    interactiveFiltersConfig?.time.presets.to &&
    parseDate(interactiveFiltersConfig?.time.presets.to.toString());

  // Reset data filters if chart type changes
  useEffect(() => {
    dispatch({
      type: "RESET_DATA_FILTER",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartConfig.chartType]);

  // Editor time presets supersede interactive state
  const presetFromStr = presetFrom?.toString();
  const presetToStr = presetTo?.toString();
  useEffect(() => {
    if (presetFrom && presetTo) {
      dispatch({ type: "ADD_TIME_FILTER", value: [presetFrom, presetTo] });
    }
  }, [dispatch, presetFromStr, presetToStr]);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
      }}
    >
      {/* Filters list & Interactive filters */}
      {chartConfig.interactiveFiltersConfig && (
        <ChartDataFilters
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
  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
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
