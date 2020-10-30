import { Box } from "@theme-ui/components";
import * as React from "react";
import { useMemo } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { TableHeader } from "./header";
import { RowMobile, RowUI } from "./row";
import { TableChartState } from "./table-state";

export const Table = () => {
  const {
    bounds,
    data,
    tableColumns,
    groupingHeaders,
  } = useChartState() as TableChartState;

  // console.log({ data });
  // console.log({ tableColumns });
  // console.log("in Table", { groupingHeaders });
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
    <>
      {/* Desktop */}
      <Box
        sx={{
          display: ["none", "block", "block"],
          width: "100%",
          height: bounds.chartHeight,
          position: "relative",
          overflow: "auto",
          bg: "monochrome100",
        }}
      >
        <Box as="table" sx={tableStyles} {...getTableProps()}>
          <TableHeader headerGroups={headerGroups} />

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              return <RowUI row={row} prepareRow={prepareRow} />;
            })}
          </tbody>
        </Box>
      </Box>

      {/* Mobile */}
      <Box
        sx={{
          display: ["block", "none", "none"],
          width: "100%",
          height: bounds.chartHeight,
          position: "relative",
          overflow: "auto",
          bg: "monochrome100",
        }}
      >
        {rows.map((row) => (
          <RowMobile row={row} prepareRow={prepareRow} />
        ))}
      </Box>
    </>
  );
};

const tableStyles = {
  borderSpacing: 0,
  border: "none",
  tableLayout: "fixed",

  fontSize: 3,
  color: "monochrome700",
  th: {
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

  td: {
    m: 0,
    py: 2,
    pr: 6,
    pl: 3,
    borderBottom: "1px solid",
    borderBottomColor: "monochrome400",
  },
};
