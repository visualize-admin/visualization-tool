import { Trans } from "@lingui/macro";
import React, { ReactNode } from "react";
import { Box, Link } from "theme-ui";
import NextLink from "next/link";
import { Loading } from "../../components/hint";
import Stack from "../../components/Stack";
import { useFormatDate } from "../../configurator/components/ui-helpers";
import {
  DataCubeMetadataQuery,
  useDataCubeMetadataQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import Tag from "./Tag";
import truthy from "../../utils/truthy";
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
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.source">Source</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            <Box
              sx={{ "> a": { color: "monochrome900" } }}
              dangerouslySetInnerHTML={{
                __html: cube.publisher,
              }}
            ></Box>
          </DatasetMetadataBody>
        </>
      )}

      <DatasetMetadataTitle>
        <Trans id="dataset.metadata.date.created">Date Created</Trans>
      </DatasetMetadataTitle>
      <DatasetMetadataBody>
        {cube.datePublished ? formatDate(cube.datePublished) ?? "–" : "–"}
      </DatasetMetadataBody>

      <DatasetMetadataTitle>
        <Trans id="dataset.metadata.version">Version</Trans>
      </DatasetMetadataTitle>
      <DatasetMetadataBody>{cube.version ?? "–"}</DatasetMetadataBody>

      <DatasetMetadataTitle>
        <Trans id="dataset.metadata.email">Contact points</Trans>
      </DatasetMetadataTitle>
      <DatasetMetadataBody>
        {cube.contactEmail ? (
          <DatasetMetadataLink
            href={`mailto:${cube.contactEmail}`}
            label={cube.contactName ?? cube.contactEmail}
          />
        ) : (
          "–"
        )}
      </DatasetMetadataBody>

      <DatasetMetadataTitle>
        <Trans id="dataset.metadata.landingPage">Further information</Trans>
      </DatasetMetadataTitle>
      <DatasetMetadataBody>
        {cube.landingPage ? (
          <DatasetMetadataLink
            href={cube.landingPage}
            label={cube.landingPage}
          />
        ) : (
          "–"
        )}
      </DatasetMetadataBody>
      <DatasetTags cube={cube} />
    </Box>
  );
};

const DatasetMetadataTitle = ({ children }: { children: ReactNode }) => (
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
const DatasetMetadataBody = ({ children }: { children: ReactNode }) => (
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

const DatasetTags = ({
  cube,
}: {
  cube: NonNullable<DataCubeMetadataQuery["dataCubeByIri"]>;
}) => {
  return (
    <Stack spacing={1} direction="row">
      {[cube.creator, ...cube.themes].filter(truthy).map((t) => (
        <NextLink
          key={t.iri}
          href={`/browse/${
            t.__typename === "DataCubeTheme" ? "theme" : "organization"
          }/${encodeURIComponent(t.iri)}`}
          passHref
        >
          <Tag as="a" type={t.__typename}>
            {t.label}
          </Tag>
        </NextLink>
      ))}
    </Stack>
  );
};
