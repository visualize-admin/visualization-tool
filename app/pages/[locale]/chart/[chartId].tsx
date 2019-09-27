import { Trans } from "@lingui/macro";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Button, Link } from "rebass";
import { DatasetSelectorField, Field } from "../../../components/field";
import { AppLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { Loader } from "../../../components/loader";
import { DataCubeProvider, useDataSets } from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";
import { CockpitChartLines } from "../../../components/cockpit-chart-lines";
import { DataCube } from "@zazuko/query-rdf-data-cube";
import { CockpitChartBars } from "../../../components/cockpit-chart-bars";
import { CockpitChartAreas } from "../../../components/cockpit-chart-areas";

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
      <h4>Select a dataset:</h4>
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
        <Box my={3} p={2}>
          <DatasetSelector datasets={datasets.data} chartId={chartId} />

          {state.state === "CONFIGURING_CHART" && (
            <>
              <h4>Select a chart type:</h4>

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
              {state.chartConfig.chartType === "bar" && state.dataSet && (
                <CockpitChartBars
                  dataset={
                    datasets.data.filter(d => d.iri === state.dataSet)[0]
                  }
                  chartId={chartId}
                />
              )}
              {state.chartConfig.chartType === "line" && state.dataSet && (
                <CockpitChartLines
                  dataset={
                    datasets.data.filter(d => d.iri === state.dataSet)[0]
                  }
                  chartId={chartId}
                />
              )}
              {state.chartConfig.chartType === "area" && state.dataSet && (
                <CockpitChartAreas
                  dataset={
                    datasets.data.filter(d => d.iri === state.dataSet)[0]
                  }
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
                href={`/[locale]/config?key=${state.configKey}`}
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
        </Box>
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
