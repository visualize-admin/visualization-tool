import { Trans } from "@lingui/macro";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Flex, Link } from "rebass";
import { Cockpit } from "../../../components/cockpit";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { ChartTypeSelector } from "../../../components/step-chart-type-selection";
import { NewChartConfigurator } from "../../../components/step-dataset-selection";
import { Stepper } from "../../../components/stepper";
import { DataCubeProvider } from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const ChartConfigurator = ({ chartId }: { chartId: string }) => {
  const [preview, updateDataSetPreview] = React.useState({
    iri: "",
    label: ""
  });

  const [state, dispatch] = useConfiguratorState();

  return (
    <Box bg="muted">
      <Flex>
        {chartId === "new" ? (
          <NewChartConfigurator
            preview={preview}
            updateDataSetPreview={updateDataSetPreview}
          />
        ) : (
          <>
            {state.state === "SELECTING_CHART_TYPE" && (
              <>
                {/* Step 2: SELECTING_CHART_TYPE  */}
                <ChartTypeSelector chartId={chartId} dataSet={state.dataSet} />
              </>
            )}
            {state.state === "CONFIGURING_CHART" && (
              <>
                {/* Step 3: CONFIGURING_CHART */}
                {state.dataSet && state.chartConfig.chartType && (
                  <Cockpit chartId={chartId} dataSetIri={state.dataSet} />
                )}
              </>
            )}
            {/* Step 5 */}
            {state.state === "PUBLISHING" && (
              <Button onClick={() => dispatch({ type: "PUBLISH" })}>
                Publish
              </Button>
            )}
            {/* Step 6 */}
            {state.state === "PUBLISHED" && (
              <Box m={2} bg="secondary" color="white" p={2}>
                <Trans id="test-form-success">
                  Konfiguration gespeichert unter
                </Trans>
                <LocalizedLink href={`/[locale]/v/${state.configKey}`} passHref>
                  <Link
                    color="white"
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                  >
                    {state.configKey}
                  </Link>
                </LocalizedLink>
              </Box>
            )}

            {/* NAVIGATION */}
            {/* <NavigationButtons /> */}

            {/* <Box my={3} p={2} bg="muted">
              <pre>{chartId}</pre>
              <pre>{JSON.stringify(state, null, 2)}</pre>
            </Box> */}
          </>
        )}
      </Flex>
    </Box>
  );
};

const ChartConfiguratorPage: NextPage = () => {
  const chartId = useChartId();

  return (
    <DataCubeProvider>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <Stepper />
          <ChartConfigurator chartId={chartId} />
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default ChartConfiguratorPage;
