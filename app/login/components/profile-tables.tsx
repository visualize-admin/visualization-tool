import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import NextLink from "next/link";

import { ParsedConfig } from "@/db/config";
import { useRootStyles } from "@/login/utils";

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
            <TableCell>Type</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Link</TableCell>
          </TableHead>
          <TableBody>
            {userConfigs.map((d) => {
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    {d.data.chartConfigs.length > 1
                      ? "multi"
                      : d.data.chartConfigs[0].chartType}
                  </TableCell>
                  <TableCell>{d.data.meta.title.en}</TableCell>
                  <TableCell>
                    <NextLink href={`/v/${d.key}`} legacyBehavior>
                      See chart
                    </NextLink>
                  </TableCell>
                </TableRow>
              );
            })}
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
