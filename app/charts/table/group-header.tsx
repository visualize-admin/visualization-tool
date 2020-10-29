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
        return (
          <>
            {cell.isGrouped ? (
              <CellContent cell={cell} columnMeta={tableColumnsMeta[i]}>
                <>
                  <span {...row.getToggleRowExpandedProps()}>{"> "}</span>
                  {cell.render("Cell")}
                </>
              </CellContent>
            ) : cell.isAggregated ? (
              // Nothing to display
              <td>{cell.render("Cell")}</td>
            ) : (
              // Nothing to display
              <td>{cell.render("Cell")}</td>
            )}
          </>
        );
      })}
    </>
  );
};
