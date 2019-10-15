import { DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Box, Button, Flex, Text } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { Container } from "./container";
import { useDataSets } from "../domain";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";
import { ActionBar } from "./action-bar";
import { Hint } from "./hint";
// import { Trans } from "@lingui/react";

export interface Preview {
  iri: string;
  label: string;
}
export const NewChartConfigurator = ({
  preview,
  updateDataSetPreview
}: {
  preview: Preview;
  updateDataSetPreview: (preview: Preview) => void;
}) => {
  const update = (preview: Preview) => {
    updateDataSetPreview(preview);
  };
  const datasets = useDataSets();

  return (
    <Box bg="muted">
      {datasets.state === "loaded" ? (
        <Flex>
          <DatasetSelector
            datasets={datasets.data}
            preview={preview}
            handleClick={preview => update(preview)}
          />
          {preview.iri && <DataSetPreview preview={preview} />}
        </Flex>
      ) : (
        <Loading>
          <Trans>Datensätze werden herausgeholt</Trans>
        </Loading>
      )}
    </Box>
  );
};

export const DatasetSelector = ({
  datasets,
  preview,
  handleClick
}: {
  datasets: DataCube[];
  preview: Preview;
  handleClick: (preview: Preview) => void;
}) => {
  return (
    <Container
      title="Datensatz auswählen"
      sx={{ m: 4, width: "322px", alignSelf: "flex-start" }}
    >
      {/* <Trans>Datensatz auswählen</Trans> */}
      {datasets.map(d => (
        <DatasetButton
          key={d.iri}
          dataSetIri={d.iri}
          dataSetLabel={d.labels[0].value}
          selected={d.iri === preview.iri}
          handleClick={handleClick}
        />
      ))}
    </Container>
  );
};

const DatasetButton = ({
  dataSetIri,
  dataSetLabel,
  selected,
  handleClick
}: {
  dataSetIri: string;
  dataSetLabel: string;
  selected: boolean;
  handleClick: (preview: Preview) => void;
}) => (
  <Button
    variant={selected ? "datasetButton.selected" : "datasetButton.normal"}
    onClick={() => handleClick({ iri: dataSetIri, label: dataSetLabel })}
  >
    <Text variant="lead" pb={1}>
      {dataSetLabel}
    </Text>
    <Text variant="paragraph2" sx={{ bg: "missing" }}>
      {"Fehlende Beschreibung des Datensatz"}
    </Text>
    <Text variant="paragraph2" my={1} sx={{ bg: "missing" }}>
      {"Fehlende Tags"}
    </Text>
  </Button>
);

const DataSetPreview = ({ preview }: { preview: Preview }) => {
  const [, dispatch] = useConfiguratorState();

  return (
    <Flex flexDirection="column">
      <Container sx={{ my: 4, mx: 3, width: "638px", minHeight: "350px" }}>
        {preview.iri ? (
          <Box p={5}>
            <Text variant="heading2" mb={1}>
              {preview.label}
            </Text>
            <Text variant="heading3" mb={1} sx={{ bg: "missing" }}>
              {"Fehlende Beschreibung des Datensatz"}
            </Text>

            <Flex
              variant="heading3"
              my={3}
              sx={{ height: "350px", bg: "missing" }}
              justifyContent="center"
              alignItems="center"
            >
              {"Vorschau des Datensatz"}
            </Flex>
          </Box>
        ) : (
          <Hint>Datensatz Auswählen</Hint>
        )}
      </Container>
      <ActionBar>
        <Button
          variant="primary"
          onClick={() =>
            dispatch({ type: "DATASET_SELECTED", value: preview.iri })
          }
          sx={{ width: "112px", ml: "auto" }}
          disabled={!preview.iri}
        >
          {/* <Trans>Weiter</Trans> */}
          Weiter
        </Button>
      </ActionBar>
    </Flex>
  );
};
