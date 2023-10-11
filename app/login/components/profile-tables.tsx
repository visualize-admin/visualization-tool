import {
  Box,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import NextLink from "next/link";

import { ParsedConfig } from "@/db/config";
import { useDataCubeMetadataQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
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
      <Typography variant="h2">My visualizations</Typography>
      {userConfigs.length > 0 ? (
        <Table>
          <TableHead>
            <TableCell>Chart type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Dataset</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Actions</TableCell>
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
    <TableRow>
      <TableCell width={80}>
        <Typography variant="body2">
          {config.data.chartConfigs.length > 1
            ? "multi"
            : config.data.chartConfigs[0].chartType}
        </Typography>
      </TableCell>
      <TableCell width="auto">
        <Typography variant="body2">
          {config.data.meta.title[locale]}
        </Typography>
      </TableCell>
      <TableCell width="40%">
        {fetching ? (
          <Skeleton variant="rectangular" width="100%" height={10} />
        ) : (
          <Typography variant="body2">
            {data?.dataCubeByIri?.title ?? ""}
          </Typography>
        )}
      </TableCell>
      <TableCell width={120}>
        {config.created_at.toLocaleDateString("de")}
      </TableCell>
      <TableCell width={80}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <NextLink href={`/v/${config.key}`} passHref legacyBehavior>
            <Link target="_blank">
              <Icon name="linkExternal" size={14} />
            </Link>
          </NextLink>
          <NextLink
            href={`/create/new?edit=${config.key}`}
            passHref
            legacyBehavior
          >
            <Link target="_blank">
              <Icon name="edit" size={14} />
            </Link>
          </NextLink>
        </Box>
      </TableCell>
    </TableRow>
  );
};
