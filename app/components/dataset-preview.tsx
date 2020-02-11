import React from "react";
import { Box, Text, Flex } from "@theme-ui/components";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";
import { DataTable } from "./datatable";
import { Trans } from "@lingui/macro";
import { useDataCubePreviewQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  // const { data: metaData } = useDataSetAndMetadata(dataSetIri);
  const [{ data: metaData }] = useDataCubePreviewQuery({
    variables: { iri: dataSetIri, locale }
  });
  if (metaData && metaData.dataCubeByIri) {
    const { dataCubeByIri } = metaData;
    return (
      <Flex
        p={5}
        sx={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Text variant="heading2" mb={1}>
          {dataCubeByIri.title}
        </Text>
        <Text variant="paragraph1" mb={4}>
          {dataCubeByIri.description}
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
            title={dataCubeByIri.title}
            dataSetIri={dataCubeByIri.iri}
            dimensions={dataCubeByIri.dimensions}
            measures={dataCubeByIri.measures}
          />
        </Box>
        <Text
          variant="table"
          color="monochrome600"
          mt={4}
          sx={{
            width: "100%",
            textAlign: "center",
            fontWeight: "light"
          }}
        >
          <Trans id="datatable.showing.first.rows">Showing first 10 rows</Trans>
        </Text>
      </Flex>
    );
  } else {
    return (
      <Flex
        p={5}
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1
        }}
      >
        {" "}
        <Loading />
      </Flex>
    );
  }
};
