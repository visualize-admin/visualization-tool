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
import { useTable } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { TableHeader } from "./header";
import { RowUI } from "./row";
import { TableState } from "./table-state";

export const Table = () => {
  const { data, columns } = useChartState() as TableState;
  console.log({ data });
  console.log({ columns });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
    setSortBy,
  } = useTable<Observation>({
    columns,
    data,
  });

  return (
    <Box as="table" {...getTableProps()} sx={{ ...tableStyles }}>
      <TableHeader headerGroups={headerGroups} />

      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          return <RowUI row={row} prepareRow={prepareRow} />;
        })}
      </tbody>
    </Box>
  );
};

const tableStyles = {
  borderSpacing: 0,
  border: "1px solid black",

  tr: {
    " :last-child": {
      td: {
        borderBottom: 0,
      },
    },
  },

  th: {
    m: 0,
    p: 2,
    borderBottom: "1px solid black",
    borderRight: 0,

    ":last-child": {
      borderRight: 0,
    },
  },
  td: {
    m: 0,
    p: 2,
    borderBottom: "1px solid black",
    borderRight: 0,

    ":last-child": {
      borderRight: 0,
    },
  },
};
