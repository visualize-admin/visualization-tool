import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Box, Link } from "theme-ui";
import { Loading } from "../../components/hint";
import { useFormatDate } from "../../configurator/components/ui-helpers";
import { useDataCubeMetadataQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";

export const DataSetMetadata = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  const formatDate = useFormatDate();
  const [{ data }] = useDataCubeMetadataQuery({
    variables: { iri: dataSetIri, locale },
  });

  if (data?.dataCubeByIri) {
    return (
      <Box sx={{ m: 4 }}>
        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.title">Title</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>{data.dataCubeByIri.title}</DataSetMetadataBody>

        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.description">Description</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>
          {data.dataCubeByIri.description || "–"}
        </DataSetMetadataBody>

        {data.dataCubeByIri.publisher && (
          <>
            <DataSetMetadataTitle>
              <Trans id="dataset.metadata.source">Source</Trans>
            </DataSetMetadataTitle>
            <DataSetMetadataBody>
              <Box
                sx={{ "> a": { color: "monochrome900" } }}
                dangerouslySetInnerHTML={{
                  __html: data.dataCubeByIri.publisher,
                }}
              ></Box>
            </DataSetMetadataBody>
          </>
        )}

        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.date.created">Date Created</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>
          {data.dataCubeByIri.datePublished
            ? formatDate(data.dataCubeByIri.datePublished) ?? "–"
            : "–"}
        </DataSetMetadataBody>

        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.version">Version</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>
          {data.dataCubeByIri.version ?? "–"}
        </DataSetMetadataBody>

        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.email">Contact points</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>
          {data.dataCubeByIri.contactEmail ? (
            <DatasetMetadataLink
              href={`mailto:${data.dataCubeByIri.contactEmail}`}
              label={
                data.dataCubeByIri.contactName ??
                data.dataCubeByIri.contactEmail
              }
            />
          ) : (
            "–"
          )}
        </DataSetMetadataBody>

        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.landingPage">Further information</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>
          {data.dataCubeByIri.landingPage ? (
            <DatasetMetadataLink
              href={data.dataCubeByIri.landingPage}
              label={data.dataCubeByIri.landingPage}
            />
          ) : (
            "–"
          )}
        </DataSetMetadataBody>
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const DataSetMetadataTitle = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      color: "monochrome600",
    }}
  >
    {children}
  </Box>
);
const DataSetMetadataBody = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4],
      color: "monochrome900",
      mb: 3,
    }}
  >
    {children}
  </Box>
);

const DatasetMetadataLink = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => (
  <Link variant="primary" href={href} target="_blank" rel="noopener noreferrer">
    {label}
  </Link>
);
