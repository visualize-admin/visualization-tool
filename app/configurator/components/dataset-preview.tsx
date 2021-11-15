import * as React from "react";
import { Box, Text, Flex, Button } from "theme-ui";
import { HintRed, Loading } from "../../components/hint";
import { DataSetPreviewTable } from "./datatable";
import { Trans } from "@lingui/macro";
import { useDataCubePreviewQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import DebugPanel from "../../components/DebugPanel";
import LinkButton from "./LinkButton";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  const [{ data: metaData }] = useDataCubePreviewQuery({
    variables: { iri: dataSetIri, locale },
  });

  if (metaData && metaData.dataCubeByIri) {
    const { dataCubeByIri } = metaData;
    return (
      <Flex
        sx={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {metaData.dataCubeByIri.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintRed iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintRed>
          </Box>
        )}
        <Flex
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 6 }}
        >
          <Text as="div" variant="heading1">
            {dataCubeByIri.title}
          </Text>
          <LinkButton
            sx={{ ml: 6, whiteSpace: "nowrap", flexShrink: 0 }}
            href={`/create/new?cube=${dataCubeByIri.iri}`}
          >
            Create visualization from dataset
          </LinkButton>
        </Flex>
        <Box
          sx={{
            boxShadow: "primary",
            borderRadius: 20,
            bg: "monochrome100",
            py: 6,
            px: 5,
          }}
        >
          <Text
            as="div"
            variant="paragraph1"
            sx={{ mb: 4, color: "monochrome700" }}
          >
            {dataCubeByIri.description}
          </Text>

          <Box
            variant="heading3"
            sx={{
              flexGrow: 1,
              width: "100%",
              position: "relative",
              overflowX: "auto",
              mt: 6,
            }}
          >
            <DataSetPreviewTable
              title={dataCubeByIri.title}
              dataSetIri={dataCubeByIri.iri}
              dimensions={dataCubeByIri.dimensions}
              measures={dataCubeByIri.measures}
            />
          </Box>
          <Text
            variant="table"
            sx={{
              mt: 4,
              color: "monochrome600",
              width: "100%",
              textAlign: "center",
              fontWeight: "light",
            }}
          >
            <Trans id="datatable.showing.first.rows">
              Showing first 10 rows
            </Trans>
          </Text>
          <DebugPanel configurator={true} />
        </Box>
      </Flex>
    );
  } else {
    return (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          p: 5,
        }}
      >
        <Loading />
      </Flex>
    );
  }
};
