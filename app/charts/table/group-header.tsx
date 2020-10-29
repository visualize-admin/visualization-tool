import { Box } from "@theme-ui/components";
import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellContent } from "./cell";
import { TableChartState } from "./table-state";

export const GroupHeader = ({ row }: { row: Row<Observation> }) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  return (
    <>
      {row.cells.map((cell, i) => {
        const { type, textStyle, textColor, colorScale } = tableColumnsMeta[i];
        return (
          <Box
            as="td"
            sx={{
              fontWeight: 900,
              color: "#222222",
            }}
          >
            {cell.render("Cell")}
          </Box>
        );
      })}
    </>
  );
};
