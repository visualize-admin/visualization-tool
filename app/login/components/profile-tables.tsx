import {
  Box,
  Link,
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
  const [{ data }] = useDataCubeMetadataQuery({
    variables: {
      iri: config.data.dataSet,
      sourceType: config.data.dataSource.type,
      sourceUrl: config.data.dataSource.url,
      locale,
    },
  });

  return (
    <TableRow>
      <TableCell>
        {config.data.chartConfigs.length > 1
          ? "multi"
          : config.data.chartConfigs[0].chartType}
      </TableCell>
      <TableCell>{config.data.meta.title[locale]}</TableCell>
      <TableCell>{data?.dataCubeByIri?.title ?? ""}</TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 2 }}>
          <NextLink href={`/v/${config.key}`} passHref legacyBehavior>
            <Link target="_blank">
              <Icon name="linkExternal" size={14} />
            </Link>
          </NextLink>
          <NextLink href={`/create/${config.key}`} passHref legacyBehavior>
            <Link target="_blank">
              <Icon name="edit" size={14} />
            </Link>
          </NextLink>
        </Box>
      </TableCell>
    </TableRow>
  );
};
