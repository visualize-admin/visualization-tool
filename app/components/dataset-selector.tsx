import React from "react";
import { Box, Button, Text } from "rebass";
import { useDataSets, useConfiguratorState } from "../domain";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";
import { SectionTitle } from "./chart-controls";

export const DataSetList = () => {
  const datasets = useDataSets();
  if (datasets.state === "loaded") {
    return (
      <Box sx={{ bg: "monochrome.100" }}>
        <SectionTitle>
          <Trans>Select Dataset</Trans>
        </SectionTitle>
        {datasets.data.map(d => (
          <DatasetButton
            key={d.iri}
            dataSetIri={d.iri}
            dataSetLabel={d.labels[0].value}
            dataSetDescription={d.extraMetadata.get("description")!.value}
          />
        ))}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

export const DatasetButton = ({
  dataSetIri,
  dataSetLabel,
  dataSetDescription
}: {
  dataSetIri: string;
  dataSetLabel: string;
  dataSetDescription: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const selected = dataSetIri === state.dataSet;

  return (
    <Button
      variant={selected ? "datasetButton.selected" : "datasetButton.normal"}
      onClick={() =>
        dispatch({ type: "DATASET_SELECTED", dataSet: dataSetIri })
      }
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
            bg: "primary.base",
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
};
