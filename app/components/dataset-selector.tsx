import React from "react";
import { Box, Button, Text } from "@theme-ui/components";
import { useConfiguratorState } from "../domain";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";
import { SectionTitle } from "./chart-controls";
import { useDataCubesQuery } from "../graphql/query-hooks";

export const DataSetList = () => {
  const [{ data }] = useDataCubesQuery();

  if (data) {
    return (
      <Box sx={{ bg: "monochrome100" }}>
        <SectionTitle>
          <Trans id="controls.select.dataset">Select Dataset</Trans>
        </SectionTitle>
        {data.dataCubes.map(d => (
          <DatasetButton
            key={d.iri}
            dataSetIri={d.iri}
            dataSetLabel={d.title}
            dataSetDescription={d.description}
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
  dataSetDescription: string | null;
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
            bg: "primary",
            marginTop: "-1px"
          }}
        ></Box>
      )}
      <Text variant="paragraph2" sx={{ fontWeight: "bold" }} pb={1}>
        {dataSetLabel}
      </Text>
      <Text variant="paragraph2">{dataSetDescription}</Text>
      {/* <Text variant="paragraph2" my={1} sx={{ bg: "missing" }}>
      {"Fehlende Tags"}
    </Text> */}
    </Button>
  );
};
