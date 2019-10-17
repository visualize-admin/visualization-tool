import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Button, Flex, Text } from "rebass";
import { useDataSets } from "../domain";
import { Hint, Loading, DataSetHint } from "./hint";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetList = ({
  dataSetPreview,
  updateDataSetPreview
}: {
  dataSetPreview: Preview;
  updateDataSetPreview: (dataSetPreview: Preview) => void;
}) => {
  const update = (dataSetPreview: Preview) => {
    updateDataSetPreview(dataSetPreview);
  };
  const datasets = useDataSets();

  return (
    <>
      {datasets.state === "loaded" ? (
        <Box>
          {datasets.data.map(d => (
            <DatasetButton
              key={d.iri}
              dataSetIri={d.iri}
              dataSetLabel={d.labels[0].value}
              selected={d.iri === dataSetPreview.iri}
              handleClick={dataSetPreview => update(dataSetPreview)}
            />
          ))}
        </Box>
      ) : (
        <Loading>
          <Trans>Datensätze werden herausgeholt</Trans>
        </Loading>
      )}
    </>
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
  handleClick: (dataSetPreview: Preview) => void;
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

export const DataSetPreview = ({
  dataSetPreview
}: {
  dataSetPreview: Preview;
}) => {
  return (
    <>
      {dataSetPreview.iri ? (
        <Box p={5} sx={{ textAlign: "left", width: "100%" }}>
          <Text variant="heading2" mb={1}>
            {dataSetPreview.label}
          </Text>
          <Text variant="heading3" mb={1} sx={{ bg: "missing" }}>
            {"Fehlende Beschreibung des Datensatz"}
          </Text>

          <Flex
            variant="heading3"
            my={3}
            sx={{ width: "100%", height: "600px", bg: "missing" }}
            justifyContent="center"
            alignItems="center"
          >
            {"Vorschau des Datensatz"}
          </Flex>
        </Box>
      ) : (
        <DataSetHint />
      )}
    </>
  );
};
