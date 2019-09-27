import { Trans } from "@lingui/macro";
import { DataCube } from "@zazuko/query-rdf-data-cube";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Link } from "rebass";
import { Cockpit } from "../../../components/cockpit";
import { DatasetSelectorField, Field } from "../../../components/field";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { Loader } from "../../../components/loader";
import { DataCubeProvider, useDataSets } from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const DatasetSelector = ({
  datasets,
  chartId
}: {
  datasets: DataCube[];
  chartId: string;
}) => {
  return (
    <Box mb={3}>
      <h4>Datensatz auswählen: </h4>
      {datasets.map(d => (
        <DatasetSelectorField
          key={d.iri}
          type="radio"
          chartId={chartId}
          path={"dataSet"}
          label={d.labels[0].value}
          value={d.iri}
        />
      ))}
    </Box>
  );
};

const Form = ({ chartId }: { chartId: string }) => {
  const datasets = useDataSets();
  const [state, dispatch] = useConfiguratorState({ chartId });

  if (datasets.state === "loaded") {
    return (
      <>
        {state.state === "SELECTING_DATASET" && (
          <Box width={1} my={3} p={2} bg="muted">
            <DatasetSelector datasets={datasets.data} chartId={chartId} />
          </Box>
        )}
        {state.state === "CONFIGURING_CHART" && (
          <>
            <Box width={1} my={3} p={2} bg="muted">
              {state.dataSet}
            </Box>
            <Box width={1} my={3} p={2} bg="muted">
              <h4>Charttyp auswählen</h4>
              <Field
                type="radio"
                chartId={chartId}
                path={"chartType"}
                label="Bar"
                value="bar"
              />
              <Field
                type="radio"
                chartId={chartId}
                path={"chartType"}
                label="Line"
                value="line"
              />
              <Field
                type="radio"
                chartId={chartId}
                path={"chartType"}
                label="Area"
                value="area"
              />
              <Field
                type="radio"
                chartId={chartId}
                path={"chartType"}
                label="Scatterplot"
                value="scatterplot"
              />
            </Box>

            {/* <Field
              chartId={chartId}
              path={"chartConfig.title.de"}
              label="Title de"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.fr"}
              label="Title fr"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.it"}
              label="Title it"
            />
            <Field
              chartId={chartId}
              path={"chartConfig.title.en"}
              label="Title en"
            /> */}
            {state.dataSet && state.chartConfig.chartType && (
              <Cockpit
                chartType={state.chartConfig.chartType}
                dataset={datasets.data.filter(d => d.iri === state.dataSet)[0]}
                chartId={chartId}
              />
            )}
          </>
        )}
        <Button onClick={() => dispatch({ type: "PUBLISH" })}>Publish</Button>
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

        <Box my={3} p={2} bg="muted">
          <pre>{chartId}</pre>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Box>
      </>
    );
  } else {
    return <Loader body="loading datasets list" />;
  }
};

const Page: NextPage = () => {
  const chartId = useChartId();

  return (
    <DataCubeProvider
      endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query"
      // endpoint="https://ld.stadt-zuerich.ch/query"
    >
      <AppLayout>
        <ConfiguratorStateProvider key={chartId}>
          <div>
            <LocalizedLink href={"/[locale]/chart/new"} passHref>
              <a>New chart!</a>
            </LocalizedLink>
            <Form chartId={chartId} />
          </div>
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default Page;
