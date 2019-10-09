import { Trans } from "@lingui/macro";
import { DataCube } from "@zazuko/query-rdf-data-cube";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Link, Heading, Flex } from "rebass";
import { Cockpit } from "../../../components/cockpit";
import { ChartTypeSelectorField } from "../../../components/field";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { Loading, Error } from "../../../components/hint";
import {
  DataCubeProvider,
  useDataSetAndMetadata,
  useDataSets
} from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const DatasetSelector = ({ datasets }: { datasets: DataCube[] }) => {
  const [, dispatch] = useConfiguratorState();

  return (
    <Box>
      <Heading mb={3}>Datensatz auswählen: </Heading>
      {datasets.map(d => (
        <Flex
          py={2}
          key={d.iri}
          justifyContent="space-between"
          alignItems="center"
          sx={{
            borderBottom: "1px solid #ddd",
            ":first-of-type": { borderTop: "1px solid #ddd" }
          }}
        >
          <Box>{d.labels[0].value}</Box>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "DATASET_SELECTED", value: d.iri })}
            fontSize={0}
            sx={{ maxWidth: 200 }}
          >
            Auswählen
          </Button>
        </Flex>
      ))}
    </Box>
  );
};

const NewChartConfigurator = () => {
  const datasets = useDataSets();
  return (
    <Box width={1} my={3} p={3} bg="muted">
      {datasets.state === "loaded" ? (
        <DatasetSelector datasets={datasets.data} />
      ) : (
        <Loading>loading datasets list</Loading>
      )}
    </Box>
  );
};

const ChartTypeSelector = ({
  chartId,
  dataSet
}: {
  chartId: string;
  dataSet: string;
}) => {
  const meta = useDataSetAndMetadata(dataSet);

  if (meta.state === "loaded") {
    return (
      <Box mb={3}>
        {["bar", "line", "area", "scatterplot"].map(d => (
          <ChartTypeSelectorField
            key={d}
            type="radio"
            chartId={chartId}
            path={"chartType"}
            label={d}
            value={d}
            meta={meta}
          />
        ))}
      </Box>
    );
  } else {
    return <Loading>loading datasets list</Loading>;
  }
};

const ChartConfigurator = ({ chartId }: { chartId: string }) => {
  const [state, dispatch] = useConfiguratorState();

  if (chartId === "new") {
    return <NewChartConfigurator />;
  }

  return (
    <>
      {state.state === "CONFIGURING_CHART" && (
        <>
          <Box width={1} my={3} p={2} bg="muted">
            {state.dataSet}
          </Box>
          <Box width={1} my={3} p={2} bg="muted">
            <h4>Charttyp auswählen</h4>
            <ChartTypeSelector chartId={chartId} dataSet={state.dataSet} />
          </Box>
          {state.dataSet && state.chartConfig.chartType && (
            <Cockpit chartId={chartId} dataSetIri={state.dataSet} />
          )}
        </>
      )}
      <Button onClick={() => dispatch({ type: "PUBLISH" })}>Publish</Button>
      {state.state === "PUBLISHED" && (
        <Box m={2} bg="secondary" color="white" p={2}>
          <Trans id="test-form-success">Konfiguration gespeichert unter</Trans>
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

      <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box>
    </>
  );
};

const ChartConfiguratorPage: NextPage = () => {
  const chartId = useChartId();

  return (
    <DataCubeProvider>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <ChartConfigurator chartId={chartId} />
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default ChartConfiguratorPage;
