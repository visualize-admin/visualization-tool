import React from "react";
import { Box, Text } from "rebass";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";
import { DataTable } from "./datatable";
import { Trans } from "@lingui/macro";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const meta = useDataSetAndMetadata(dataSetIri);
  if (meta.state === "loaded") {
    const { dataSet, dimensions, measures } = meta.data;
    return (
      <Box p={5} sx={{ textAlign: "left", width: "100%" }}>
        <Text variant="heading2" mb={1}>
          {meta.data.dataSet.labels[0].value}
        </Text>
        <Text variant="paragraph1" mb={4}>
          {meta.data.dataSet.extraMetadata.get("description")!.value}
        </Text>

        <Box
          variant="heading3"
          mt={6}
          sx={{ width: "100%", position: "relative", overflowX: "auto" }}
        >
          <DataTable
            dataSet={dataSet}
            dimensions={dimensions}
            measures={measures}
          />
        </Box>
        <Text
          variant="table"
          color="monochrome.600"
          mt={4}
          sx={{
            width: "100%",
            textAlign: "center",
            fontFamily: "frutigerLight"
          }}
        >
          <Trans>Showing first 10 rows</Trans>
        </Text>
      </Box>
    );
  } else {
    return <Loading />;
  }
};
