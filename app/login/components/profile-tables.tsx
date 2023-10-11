import {
  Box,
  Button,
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

type ProfileTableProps = React.PropsWithChildren<{
  title: string;
  preview?: boolean;
  onShowAll?: () => void;
}>;

const ProfileTable = (props: ProfileTableProps) => {
  const { title, preview, onShowAll, children } = props;
  const rootClasses = useRootStyles();

  return (
    <Box className={rootClasses.sectionContent}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Table>{children}</Table>
      {preview && (
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={onShowAll}
          sx={{ ml: 1, mt: 2 }}
        >
          <Typography variant="body2">Show all</Typography>
        </Button>
      )}
    </Box>
  );
};

type ProfileVisualizationsTableProps = {
  userConfigs: ParsedConfig[];
  preview?: boolean;
  onShowAll?: () => void;
};

export const ProfileVisualizationsTable = (
  props: ProfileVisualizationsTableProps
) => {
  const { userConfigs, preview, onShowAll } = props;

  return (
    <ProfileTable
      title="My visualizations"
      preview={preview && userConfigs.length > 0}
      onShowAll={onShowAll}
    >
      {userConfigs.length > 0 ? (
        <>
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
            {(preview ? userConfigs.slice(0, 3) : userConfigs).map((d) => (
              <ProfileVisualizationsRow key={d.key} config={d} />
            ))}
          </TableBody>
        </>
      ) : (
        <Typography variant="body1">
          No charts yet,{" "}
          <NextLink href="/browse" legacyBehavior>
            create one
          </NextLink>
          .
        </Typography>
      )}
    </ProfileTable>
  );
};

type ProfileVisualizationsRowProps = {
  config: ParsedConfig;
};

const ProfileVisualizationsRow = (props: ProfileVisualizationsRowProps) => {
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
  const links: ActionsLinkProps[] = React.useMemo(() => {
    return [
      {
        href: `/create/new?copy=${config.key}`,
        label: "Copy",
        iconName: "copy",
      },
      {
        href: `/create/new?edit=${config.key}`,
        label: "Edit",
        iconName: "edit",
      },
      {
        href: `/v/${config.key}`,
        label: "Share",
        iconName: "linkExternal",
      },
    ];
  }, [config.key]);

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
        <Actions links={links} />
      </TableCell>
    </TableRow>
  );
};

type ActionsProps = {
  links: ActionsLinkProps[];
};

const Actions = (props: ActionsProps) => {
  const { links } = props;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, open, close } = useDisclosure();

  return (
    <ClickAwayListener onClickAway={close}>
      <Tooltip
        arrow
        open={isOpen}
        title={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {links.map((props) => (
              <ActionsLink key={props.href} {...props} />
            ))}
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
