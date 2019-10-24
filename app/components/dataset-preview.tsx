import React from "react";
import { Box, Flex, Text } from "rebass";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const meta = useDataSetAndMetadata(dataSetIri);

  if (meta.state === "loaded") {
    return (
      <Box p={5} sx={{ textAlign: "left", width: "100%" }}>
        <Text variant="heading2" mb={1}>
          {meta.data.dataSet.labels[0].value}
        </Text>
        <Text variant="paragraph1" mb={2}>
          {meta.data.dataSet.extraMetadata.get("description")!.value}
        </Text>

        <Flex
          variant="heading3"
          my={3}
          sx={{ width: "100%", height: "450px", bg: "missing" }}
          justifyContent="center"
          alignItems="center"
        >
          {"Vorschau des Datensatz"}
        </Flex>
      </Box>
    );
  } else {
    return <Loading />;
  }
};
