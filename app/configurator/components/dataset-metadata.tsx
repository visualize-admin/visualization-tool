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
  const cube = data?.dataCubeByIri;
  if (!cube) {
    return <Loading />;
  }

  return (
    <Box sx={{ m: 4 }}>
      {cube.publisher && (
        <>
          <DataSetMetadataTitle>
            <Trans id="dataset.metadata.source">Source</Trans>
          </DataSetMetadataTitle>
          <DataSetMetadataBody>
            <Box
              sx={{ "> a": { color: "monochrome900" } }}
              dangerouslySetInnerHTML={{
                __html: cube.publisher,
              }}
            ></Box>
          </DataSetMetadataBody>
        </>
      )}

      <DataSetMetadataTitle>
        <Trans id="dataset.metadata.date.created">Date Created</Trans>
      </DataSetMetadataTitle>
      <DataSetMetadataBody>
        {cube.datePublished ? formatDate(cube.datePublished) ?? "–" : "–"}
      </DataSetMetadataBody>

      <DataSetMetadataTitle>
        <Trans id="dataset.metadata.version">Version</Trans>
      </DataSetMetadataTitle>
      <DataSetMetadataBody>{cube.version ?? "–"}</DataSetMetadataBody>

      <DataSetMetadataTitle>
        <Trans id="dataset.metadata.email">Contact points</Trans>
      </DataSetMetadataTitle>
      <DataSetMetadataBody>
        {cube.contactEmail ? (
          <DatasetMetadataLink
            href={`mailto:${cube.contactEmail}`}
            label={cube.contactName ?? cube.contactEmail}
          />
        ) : (
          "–"
        )}
      </DataSetMetadataBody>

      <DataSetMetadataTitle>
        <Trans id="dataset.metadata.landingPage">Further information</Trans>
      </DataSetMetadataTitle>
      <DataSetMetadataBody>
        {cube.landingPage ? (
          <DatasetMetadataLink
            href={cube.landingPage}
            label={cube.landingPage}
          />
        ) : (
          "–"
        )}
      </DataSetMetadataBody>
    </Box>
  );
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
