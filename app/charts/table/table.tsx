import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Input,
  Label,
  Radio,
  Select,
  Text,
} from "@theme-ui/components";
import * as React from "react";
import { useMemo } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { TableHeader } from "./header";
import { RowUI } from "./row";
import { TableChartState } from "./table-state";

export const Table = () => {
  const {
    data,
    tableColumns,
    groupingHeaders,
  } = useChartState() as TableChartState;

  console.log({ data });
  console.log({ tableColumns });
  console.log("in Table", { groupingHeaders });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<Observation>(
    {
      columns: tableColumns,
      data,
      useControlledState: (state) => {
        return useMemo(
          () => ({
            ...state,
            groupBy: groupingHeaders,
          }),
          [state, groupingHeaders]
        );
      },
    },

    useGroupBy,
    useExpanded
  );

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        overflowX: "auto",
        bg: "monochrome100",
        p: 4, // FIXME
      }}
    >
      <Box as="table" {...getTableProps()} sx={{ ...tableStyles }}>
        <TableHeader headerGroups={headerGroups} />

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            return <RowUI row={row} prepareRow={prepareRow} />;
          })}
        </tbody>
      </Box>
    </Box>
  );
};

const tableStyles = {
  width: "100%",
  height: "100%",
  borderSpacing: 0,
  border: "none",

  th: {
    minWidth: 100,
    m: 0,
    py: 2,
    pr: 6,
    pl: 3,
    borderTop: "1px solid",
    borderTopColor: "monochrome700",
    borderBottom: "1px solid",
    borderBottomColor: "monochrome700",
    borderRight: 0,
    borderLeft: 0,
    fontWeight: "bold",

    color: "monochrome700",
    ":last-child": {
      borderRight: 0,
    },
  },

  tr: {
    color: "monochrome700",
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },

  td: {
    minWidth: 100,
    m: 0,
    py: 2,
    pr: 6,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },
};
