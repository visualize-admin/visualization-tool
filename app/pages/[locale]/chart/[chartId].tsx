import { Trans } from "@lingui/macro";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Flex, Link } from "rebass";
import { ChartConfigurator } from "../../../components/chart-configurator";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { ChartTypeSelector } from "../../../components/chart-type-selector";
import {
  DataSetList,
  DataSetPreview
} from "../../../components/dataset-selector";
import { Stepper } from "../../../components/stepper";
import { DataCubeProvider } from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";
import { Container, MiddleContainer } from "../../../components/container";
import { ActionBar } from "../../../components/action-bar";
import { ChartPreview } from "../../../components/chart-preview";
import { ChartFilters } from "../../../components/chart-filters";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const ChartCreator = ({ chartId }: { chartId: string }) => {
  // Local state, the dataset preview doesn't need to be persistent.
  const [dataSetPreview, updateDataSetPreview] = React.useState({
    iri: "",
    label: ""
  });

  const [state, dispatch] = useConfiguratorState();

  return (
    <Box bg="muted">
      {/* <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box> */}

      <Flex>
        {/* LEFT */}
        <Container
          title="Datensatz auswählen" // FIXME: change title on step change
          sx={{ m: 4, width: "322px", alignSelf: "flex-start" }}
        >
          {chartId === "new" ? (
            <DataSetList
              dataSetPreview={dataSetPreview}
              updateDataSetPreview={updateDataSetPreview}
            />
          ) : (
            <>
              {state.state === "SELECTING_CHART_TYPE" && (
                <ChartTypeSelector chartId={chartId} dataSet={state.dataSet} />
              )}
              {state.state === "CONFIGURING_CHART" && (
                <>
                  {/* Step 3: CONFIGURING_CHART */}
                  {state.dataSet && state.chartConfig.chartType && (
                    <ChartConfigurator
                      chartId={chartId}
                      dataSetIri={state.dataSet}
                    />
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
                  <LocalizedLink
                    href={`/[locale]/v/${state.configKey}`}
                    passHref
                  >
                    <Link
                      color="white"
                      sx={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      {state.configKey}
                    </Link>
                  </LocalizedLink>
                </Box>
              )}
            </>
          )}
        </Container>

        {/* Middle */}
        <Box>
          <MiddleContainer>
            {chartId === "new" ? (
              <DataSetPreview dataSetPreview={dataSetPreview} />
            ) : (
              <>
                {(state.state === "SELECTING_CHART_TYPE" ||
                  state.state === "CONFIGURING_CHART") && (
                  <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
                )}
              </>
            )}
          </MiddleContainer>

          {/* ACTIONS */}
          <ActionBar>
            {chartId === "new" ? (
              <Button
                variant="primary"
                onClick={() =>
                  dispatch({
                    type: "DATASET_SELECTED",
                    value: dataSetPreview.iri
                  })
                }
                sx={{ width: "112px", ml: "auto" }}
                disabled={!dataSetPreview.iri}
              >
                <Trans>Weiter</Trans>
              </Button>
            ) : (
              <>
                {state.state === "SELECTING_CHART_TYPE" && (
                  <Button
                    variant="primary"
                    onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                    sx={{ width: "112px", ml: "auto" }}
                    disabled={state.chartConfig.chartType === "none"}
                  >
                    <Trans>Weiter</Trans>
                  </Button>
                )}
                {state.state === "CONFIGURING_CHART" && (
                  <Button
                    variant="primary"
                    onClick={() => dispatch({ type: "PUBLISH" })}
                    sx={{ width: "112px", ml: "auto" }}
                    // disabled={state.chartConfig.chartType === "none"}
                  >
                    <Trans>Publizieren</Trans>
                  </Button>
                )}
              </>
            )}
          </ActionBar>
        </Box>

        {/* RIGHT */}
        {state.state === "CONFIGURING_CHART" && (
          <Container
            title="Daten Filter" // FIXME: Translate
            sx={{ m: 4, width: "322px", alignSelf: "flex-start" }}
          >
            <ChartFilters chartId={chartId} dataSetIri={state.dataSet} />
          </Container>
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
          <ChartCreator chartId={chartId} />
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default ChartConfiguratorPage;
