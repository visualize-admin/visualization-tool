import { Trans } from "@lingui/macro";
import NextLink from "next/link";
import React, { ReactNode } from "react";
import { Box, BoxProps, Link, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { useFormatDate } from "../../configurator/components/ui-helpers";
import {
  DataCubeMetadataQuery,
  useDataCubeMetadataQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import truthy from "../../utils/truthy";
import Tag from "./Tag";
import { MotionBox, smoothPresenceProps } from "./presence";
import { Link as MUILink } from "@mui/material";

export const DataSetMetadata = ({
  dataSetIri,
  sx,
}: {
  dataSetIri: string;
  sx: BoxProps["sx"];
}) => {
  const locale = useLocale();
  const formatDate = useFormatDate();
  const [{ data, fetching, error }] = useDataCubeMetadataQuery({
    variables: { iri: dataSetIri, locale },
  });
  const cube = data?.dataCubeByIri;
  if (fetching || error || !cube) {
    // The error and loading are managed by the component
    // displayed in the middle panel
    return null;
  }

  return (
    <MotionBox
      sx={{ mx: 4, ...sx }}
      key="dataset-metadata"
      {...smoothPresenceProps}
    >
      {cube.publisher && (
        <>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.source">Source</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            <Box
              sx={{ "> a": { color: "grey.900" } }}
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
    </MotionBox>
  );
};

const DatasetMetadataTitle = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="caption"
    sx={{
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "bold",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      color: "grey.700",
    }}
  >
    {children}
  </Typography>
);
const DatasetMetadataBody = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="body2"
    sx={{
      lineHeight: ["1.375rem", "1.5rem", "1.5rem"],
      fontWeight: "regular",
      fontSize: ["0.875rem", "0.875rem", "0.875rem"],
      color: "grey.900",
      mb: 3,
    }}
  >
    {children}
  </Typography>
);

const DatasetMetadataLink = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => (
  <Link
    underline="hover"
    color="primary"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {label}
  </Link>
);

const DatasetTags = ({
  cube,
}: {
  cube: NonNullable<DataCubeMetadataQuery["dataCubeByIri"]>;
}) => {
  return (
    <Stack spacing={1} direction="column">
      {[cube.creator, ...cube.themes].filter(truthy).map((t) => (
        <NextLink
          key={t.iri}
          href={`/browse/${
            t.__typename === "DataCubeTheme" ? "theme" : "organization"
          }/${encodeURIComponent(t.iri)}`}
          passHref
        >
          <Tag
            component={MUILink}
            /*
            // @ts-ignore */
            underline="none"
            type={t.__typename}
            title={t.label || undefined}
            sx={{
              maxWidth: "100%",
              display: "flex",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {t.label}
          </Tag>
        </NextLink>
      ))}
    </Stack>
  );
};
