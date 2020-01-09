import React from "react";
import { Box, Text, Flex } from "rebass";
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
      <Flex
        flexDirection="column"
        justifyContent="space-between"
        p={5}
        sx={{ flexGrow: 1 }}
      >
        <Text variant="heading2" mb={1}>
          {dataSet.label.value}
        </Text>
        <Text variant="paragraph1" mb={4}>
          {dataSet.extraMetadata.get("description")!.value}
        </Text>

        <Box
          variant="heading3"
          mt={6}
          sx={{
            flexGrow: 1,
            width: "100%",
            position: "relative",
            overflowX: "auto"
          }}
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
      </Flex>
    );
  } else {
    return (
      <Flex
        flexDirection="column"
        justifyContent="space-between"
        p={5}
        sx={{ flexGrow: 1 }}
      >
        {" "}
        <Loading />
      </Flex>
    );
  }
};
