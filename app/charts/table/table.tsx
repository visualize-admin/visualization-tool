import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import * as React from "react";
import { useMemo, useState } from "react";
import { useExpanded, useGroupBy, useTable } from "react-table";
import { Switch } from "../../components/form";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { TABLE_STYLES } from "./constants";
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

  const [useAlternativeMobileView, toggleAlternativeMobileView] = useState(
    false
  );

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
      <Box sx={{ display: ["block", "none", "none"], my: 3 }}>
        <Switch
          label={
            <Trans id="chart.published.toggle.mobile.view">
              Toggle alternative mobile view
            </Trans>
          }
          name={"Toggle alternative mobile view"}
          checked={useAlternativeMobileView}
          disabled={false}
          onChange={() =>
            toggleAlternativeMobileView(!useAlternativeMobileView)
          }
        />
      </Box>

      {/* Desktop */}
      <Box
        sx={{
          display: useAlternativeMobileView
            ? ["none", "block", "block"]
            : "block",
          width: "100%",
          height: bounds.chartHeight,
          position: "relative",
          overflow: "auto",
          bg: "monochrome100",
        }}
      >
        <Box as="table" sx={TABLE_STYLES} {...getTableProps()}>
          <TableHeader headerGroups={headerGroups} />

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              return <RowUI row={row} prepareRow={prepareRow} />;
            })}
          </tbody>
        </Box>
      </Box>

      {/* Alternative Mobile View */}

      <Box
        sx={{
          display: useAlternativeMobileView
            ? ["block", "none", "none"]
            : "none",
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
