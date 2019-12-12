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
  const { data: metaData } = useDataSetAndMetadata(dataSetIri);
  if (metaData) {
    const { dataSet, dimensions, measures } = metaData;
    return (
      <Box p={5} sx={{ textAlign: "left", width: "100%" }}>
        <Text variant="heading2" mb={1}>
          {dataSet.label.value}
        </Text>
        <Text variant="paragraph1" mb={4}>
          {dataSet.extraMetadata.get("description")!.value}
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
          <Trans id="datatable.showing.first.rows">Showing first 10 rows</Trans>
        </Text>
      </Box>
    );
  } else {
    return <Loading />;
  }
};
