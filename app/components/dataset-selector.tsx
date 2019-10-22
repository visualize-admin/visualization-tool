import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Button, Text } from "rebass";
import { useDataSets } from "../domain";
import { Loading } from "./hint";

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
  if (datasets.state === "loaded") {
    return (
      <Box sx={{ bg: "monochrome.100" }}>
        {datasets.data.map(d => (
          <DatasetButton
            key={d.iri}
            dataSetIri={d.iri}
            dataSetLabel={d.labels[0].value}
            dataSetDescription={d.extraMetadata.get("description")!.value}
            selected={d.iri === dataSetPreview.iri}
            handleClick={dataSetPreview => update(dataSetPreview)}
          />
        ))}
      </Box>
    );
  } else {
    return (
      <Loading>
        <Trans>Datensätze werden geladen</Trans>
      </Loading>
    );
  }
};

const DatasetButton = ({
  dataSetIri,
  dataSetLabel,
  dataSetDescription,
  selected,
  handleClick
}: {
  dataSetIri: string;
  dataSetLabel: string;
  dataSetDescription: string;
  selected: boolean;
  handleClick: (dataSetPreview: Preview) => void;
}) => (
  <Button
    variant={selected ? "datasetButton.selected" : "datasetButton.normal"}
    onClick={() => handleClick({ iri: dataSetIri, label: dataSetLabel })}
  >
    {selected && (
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "calc(100% + 2px)",
          bg: "ch.venetianRed",
          marginTop: "-1px"
        }}
      ></Box>
    )}
    <Text variant="paragraph2" sx={{ fontFamily: "frutigerBold" }} pb={1}>
      {dataSetLabel}
    </Text>
    <Text variant="paragraph2">{dataSetDescription}</Text>
    {/* <Text variant="paragraph2" my={1} sx={{ bg: "missing" }}>
      {"Fehlende Tags"}
    </Text> */}
  </Button>
);
