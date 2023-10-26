import { Trans } from "@lingui/macro";
import {
  Box,
  Link,
  LinkProps,
  Link as MUILink,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import NextLink from "next/link";
import React, { ReactNode } from "react";

import Tag from "@/components/tag";
import { DataSource } from "@/config-types";
import { truthy } from "@/domain/types";
import { useFormatDate } from "@/formatters";
import {
  DataCubeMetadataQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";

export const DataSetMetadata = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  const locale = useLocale();
  const formatDate = useFormatDate();
  const [{ data, fetching, error }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const cube = data?.dataCubeByIri;
  const openDataLink = makeOpenDataLink(locale, cube);
  if (fetching || error || !cube) {
    // The error and loading are managed by the component
    // displayed in the middle panel
    return null;
  }

  return (
    <div>
      {cube.publisher && (
        <>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.source">Source</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            <Box
              component="span"
              sx={{ "> a": { color: "grey.900" } }}
              dangerouslySetInnerHTML={{
                __html: cube.publisher,
              }}
            />
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
        <Trans id="dataset.metadata.furtherinformation">
          Further information
        </Trans>
      </DatasetMetadataTitle>
      <DatasetMetadataBody sx={{ mb: 5 }}>
        {cube.landingPage ? (
          <DatasetMetadataLink
            href={cube.landingPage}
            external
            label={
              <Trans id="dataset.metadata.learnmore">
                Learn more about the dataset
              </Trans>
            }
          />
        ) : (
          "–"
        )}

        {openDataLink ? (
          <>
            <br />
            <DatasetMetadataLink
              external
              label="OpenData.swiss"
              href={openDataLink}
            />
          </>
        ) : null}
      </DatasetMetadataBody>
      <DatasetTags cube={cube} />
    </div>
  );
};

const DatasetMetadataTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="body2" fontWeight={700} sx={{ color: "grey.700" }}>
    {children}
  </Typography>
);

const DatasetMetadataBody = ({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => (
  <Typography variant="body2" sx={{ color: "grey.900", mb: 4, ...sx }}>
    {children}
  </Typography>
);

const DatasetMetadataLink = ({
  href,
  label,
  external,
  ...props
}: {
  href: string;
  label: string | React.ReactElement;
  external?: boolean;
} & LinkProps) => (
  <Link
    underline="hover"
    color="primary"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    {...props}
  >
    {label}
    {external ? <Icon name="linkExternal" size={12} /> : null}
  </Link>
);

const DatasetTags = ({
  cube,
}: {
  cube: NonNullable<DataCubeMetadataQuery["dataCubeByIri"]>;
}) => {
  return (
    <>
      <DatasetMetadataTitle>
        <Trans id="dataset-preview.keywords">Keywords</Trans>
      </DatasetMetadataTitle>
      <Stack spacing={1} direction="column" sx={{ mt: 3 }}>
        {[cube.creator, ...cube.themes].filter(truthy).map((t) => {
          const type =
            t.__typename === "DataCubeTheme" ? "theme" : "organization";

          return t.label ? (
            <NextLink
              key={t.iri}
              href={`/browse/${type}/${encodeURIComponent(t.iri)}`}
              passHref
              legacyBehavior
            >
              <Tag
                component={MUILink}
                // @ts-ignore
                underline="none"
                type={type}
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
          ) : null;
        })}
      </Stack>
    </>
  );
};
