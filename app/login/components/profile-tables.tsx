import {
  Box,
  ClickAwayListener,
  IconButton,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import React from "react";

import useDisclosure from "@/components/use-disclosure";
import { ParsedConfig } from "@/db/config";
import { sourceToLabel } from "@/domain/datasource";
import { useDataCubeMetadataQuery } from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";
import { useRootStyles } from "@/login/utils";
import { useLocale } from "@/src";

type ProfileVisualizationsTableProps = {
  userConfigs: ParsedConfig[];
};

export const ProfileVisualizationsTable = (
  props: ProfileVisualizationsTableProps
) => {
  const { userConfigs } = props;
  const rootClasses = useRootStyles();

  return (
    <Box className={rootClasses.sectionContent}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        My visualizations
      </Typography>
      <Typography variant="h3" sx={{ mb: 2 }}>
        My published visualizations
      </Typography>
      {userConfigs.length > 0 ? (
        <Table>
          <TableHead
            sx={{
              "& > .MuiTableCell-root": {
                borderBottomColor: "divider",
                color: "secondary.main",
              },
            }}
          >
            <TableCell>Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Dataset</TableCell>
            <TableCell>Published</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableHead>
          <TableBody>
            {userConfigs.map((d) => (
              <Row key={d.key} config={d} />
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body1">
          No charts yet,{" "}
          <NextLink href="/browse" legacyBehavior>
            create one
          </NextLink>
          .
        </Typography>
      )}
    </Box>
  );
};

type RowProps = {
  config: ParsedConfig;
};

const Row = (props: RowProps) => {
  const { config } = props;
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubeMetadataQuery({
    variables: {
      iri: config.data.dataSet,
      sourceType: config.data.dataSource.type,
      sourceUrl: config.data.dataSource.url,
      locale,
    },
  });

  return (
    <TableRow
      sx={{
        verticalAlign: "middle",
        height: 56,
        "& > .MuiTableCell-root": {
          borderBottomColor: "divider",
        },
      }}
    >
      <TableCell width={80}>
        <Typography variant="body2">
          {config.data.chartConfigs.length > 1 ? "multi" : "single"}
        </Typography>
      </TableCell>
      <TableCell width="auto">
        <Typography variant="body2">
          {config.data.meta.title[locale]}
        </Typography>
      </TableCell>
      <TableCell width="40%">
        {fetching ? (
          <Skeleton width="50%" height={32} />
        ) : (
          <NextLink
            href={`/browse?dataset=${
              config.data.dataSet
            }&dataSource=${sourceToLabel(config.data.dataSource)}`}
            passHref
            legacyBehavior
          >
            <Link target="_blank" color="primary">
              <Typography variant="body2">
                {data?.dataCubeByIri?.title ?? ""}
              </Typography>
            </Link>
          </NextLink>
        )}
      </TableCell>
      <TableCell width={120}>
        <Typography variant="body2">
          {config.created_at.toLocaleDateString("de")}
        </Typography>
      </TableCell>
      <TableCell width={80} align="right">
        <Actions configKey={config.key} />
      </TableCell>
    </TableRow>
  );
};

type ActionsProps = {
  configKey: string;
};

const Actions = (props: ActionsProps) => {
  const { configKey } = props;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, open, close } = useDisclosure();

  return (
    <ClickAwayListener onClickAway={close}>
      <Tooltip
        arrow
        open={isOpen}
        title={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ActionsLink
              href={`/create/new?copy=${configKey}`}
              label="Copy"
              iconName="copy"
            />
            <ActionsLink
              href={`/create/new?edit=${configKey}`}
              label="Edit"
              iconName="edit"
            />
            <ActionsLink
              href={`/v/${configKey}`}
              label="Share"
              iconName="linkExternal"
            />
          </Box>
        }
        sx={{ p: 2 }}
        componentsProps={{ tooltip: { sx: { p: 3, pb: 2 } } }}
      >
        <IconButton ref={buttonRef} onClick={isOpen ? close : open}>
          <Icon name="more" size={16} />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

type ActionsLinkProps = {
  href: string;
  label: string;
  iconName: IconName;
};

const ActionsLink = (props: ActionsLinkProps) => {
  const { href, label, iconName } = props;

  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link
        target="_blank"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "primary.main",
        }}
      >
        <Icon name={iconName} size={16} />
        <Typography variant="body2">{label}</Typography>
      </Link>
    </NextLink>
  );
};
