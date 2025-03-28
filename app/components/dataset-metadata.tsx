import { Trans } from "@lingui/macro";
import {
  Box,
  Link,
  Link as MUILink,
  LinkProps,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import React, { ReactNode } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { DataDownloadMenu } from "@/components/data-download";
import Tag from "@/components/tag";
import { DataSource } from "@/configurator";
import { DataCubeMetadata } from "@/domain/data";
import { useFormatDate } from "@/formatters";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";

export const DatasetMetadata = ({
  cube,
  showTitle,
  sparqlEditorUrl,
  dataSource,
  queryFilters,
}: {
  cube: DataCubeMetadata;
  showTitle: boolean;
  sparqlEditorUrl?: string;
  dataSource: DataSource;
  queryFilters?: ReturnType<typeof useQueryFilters>[number];
}) => {
  const locale = useLocale();
  const formatDate = useFormatDate();
  const openDataLink = cube ? makeOpenDataLink(locale, cube) : null;
  return (
    <div>
      {showTitle ? (
        <Typography variant="h4" sx={{ mb: 3 }} color="grey.700">
          {cube.title}
        </Typography>
      ) : null}
      <Stack spacing={2}>
        {cube.publisher && (
          <div>
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
          </div>
        )}
        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.date.created">Date Created</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            {cube.datePublished ? (formatDate(cube.datePublished) ?? "–") : "–"}
          </DatasetMetadataBody>
        </div>
        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.version">Version</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>{cube.version ?? "–"}</DatasetMetadataBody>
        </div>
        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.email">Contact points</Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody>
            {cube.contactPoint?.email && cube.contactPoint.name ? (
              <DatasetMetadataLink
                href={`mailto:${cube.contactPoint.email}`}
                label={cube.contactPoint.name ?? cube.contactPoint.email}
              />
            ) : (
              "–"
            )}
          </DatasetMetadataBody>
        </div>
        <div>
          <DatasetMetadataTitle>
            <Trans id="dataset.metadata.furtherinformation">
              Further information
            </Trans>
          </DatasetMetadataTitle>
          <DatasetMetadataBody sx={{ mt: 2 }}>
            {cube.landingPage ? (
              <DatasetMetadataLink
                href={cube.landingPage}
                external
                label={
                  <Trans id="dataset.metadata.learnmore">
                    More about the dataset
                  </Trans>
                }
              />
            ) : (
              "–"
            )}
            {sparqlEditorUrl ? (
              <DatasetSparqlQuery url={sparqlEditorUrl} />
            ) : null}
            {queryFilters ? (
              <DataDownloadMenu
                dataSource={dataSource}
                title={cube.title}
                filters={queryFilters}
              />
            ) : null}
            {openDataLink ? (
              <DatasetMetadataLink
                external
                label="OpenData.swiss"
                href={openDataLink}
              />
            ) : null}
          </DatasetMetadataBody>
        </div>
        <Stack spacing={2}>
          <DatasetMetadataTitle>
            <Trans id="dataset-preview.keywords">Keywords</Trans>
          </DatasetMetadataTitle>
          <DatasetTags cube={cube} />
        </Stack>
      </Stack>
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
  <Typography
    variant="body2"
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      color: "grey.900",
      ...sx,
    }}
  >
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
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    {...props}
  >
    {external ? <Icon name="legacyLinkExternal" size={16} /> : null}
    {label}
  </Link>
);

const DatasetSparqlQuery = ({ url }: { url: string }) => {
  return (
    <Link
      underline="hover"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    >
      <Icon name="legacyLinkExternal" size={16} />
      <Trans id="chart-controls.sparql-query">SPARQL query</Trans>
    </Link>
  );
};

const DatasetTags = ({ cube }: { cube: DataCubeMetadata }) => {
  return (
    <Stack spacing={1} direction="column">
      {cube.creator?.iri && (
        <DatasetMetadataTag
          type="organization"
          iri={cube.creator.iri}
          label={cube.creator.label}
        />
      )}
      {cube.themes &&
        sortBy(cube.themes, (d) => d.label).map(
          (t) =>
            t.iri &&
            t.label && (
              <DatasetMetadataTag
                key={t.iri}
                type="theme"
                iri={t.iri}
                label={t.label}
              />
            )
        )}
    </Stack>
  );
};

type DatasetMetadataTagProps = {
  type: "organization" | "theme";
  iri: string;
  label?: string | null;
};

const DatasetMetadataTag = (props: DatasetMetadataTagProps) => {
  const { type, iri, label } = props;

  return (
    <NextLink
      key={iri}
      href={`/browse/${type}/${encodeURIComponent(iri)}`}
      passHref
      legacyBehavior
    >
      <Tag
        component={MUILink}
        // @ts-ignore
        underline="none"
        type={type}
        title={label ?? undefined}
        sx={{
          maxWidth: "100%",
          display: "flex",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {label}
      </Tag>
    </NextLink>
  );
};
