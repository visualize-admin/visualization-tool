import { Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Link,
  LinkProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { Stack } from "@mui/material";
import { Link as MUILink } from "@mui/material";
import NextLink from "next/link";
import React, { ReactNode } from "react";

import Tag from "@/configurator/components/Tag";
import {
  MotionBox,
  smoothPresenceProps,
} from "@/configurator/components/presence";
import { useFormatDate } from "@/configurator/components/ui-helpers";
import {
  DataCubeMetadataQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { DataSource } from "@/graphql/resolvers/utils";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";
import truthy from "@/utils/truthy";

export const DataSetMetadata = ({
  dataSetIri,
  dataSource,
  sx,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  sx: BoxProps["sx"];
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
              <Trans id="dataset.metadata.landingpage">Landing page</Trans>
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
      lineHeight: ["1.375rem", "1.5rem", "1.5rem"],
      fontWeight: "regular",
      fontSize: ["0.875rem", "0.875rem", "0.875rem"],
      color: "grey.900",
      mb: 3,
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
