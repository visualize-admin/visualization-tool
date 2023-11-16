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
import { DataCubeMetadata } from "@/domain/data";
import { useFormatDate } from "@/formatters";
import { useDataCubesMetadataQuery } from "@/graphql/query-hooks";
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
  const [{ data, fetching, error }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: [{ iri: dataSetIri }],
    },
  });
  const cube = data?.dataCubesMetadata[0];
  const openDataLink = cube ? makeOpenDataLink(locale, cube) : null;
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
        {cube.contactPoint?.email && cube.contactPoint.name ? (
          <DatasetMetadataLink
            href={`mailto:${cube.contactPoint.email}`}
            label={cube.contactPoint.name ?? cube.contactPoint.email}
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

const DatasetTags = ({ cube }: { cube: DataCubeMetadata }) => {
  return (
    <>
      <DatasetMetadataTitle>
        <Trans id="dataset-preview.keywords">Keywords</Trans>
      </DatasetMetadataTitle>
      <Stack spacing={1} direction="column" sx={{ mt: 3 }}>
        {cube.creator?.iri && (
          <DatasetMetadataTag
            type="organization"
            iri={cube.creator.iri}
            label={cube.creator.label}
          />
        )}
        {cube.themes?.map((t) => (
          <DatasetMetadataTag
            key={t.iri}
            type="theme"
            iri={t.iri}
            label={t.label}
          />
        ))}
      </Stack>
    </>
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
