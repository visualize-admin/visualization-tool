import * as React from "react";
import { Row } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellContent } from "./cell";
import { GroupHeader } from "./group-header";
import { TableChartState } from "./table-state";

export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  prepareRow(row);
  return (
    <>
      <tr {...row.getRowProps()}>
        {row.subRows.length === 0 ? (
          <>
            {row.cells.map((cell, i) => {
              return (
                <CellContent cell={cell} columnMeta={tableColumnsMeta[i]}>
                  {cell.render("Cell")}
                </CellContent>
              );
            })}
          </>
        ) : (
          <GroupHeader row={row} />
        )}
      </tr>
      {/* Display rows within a group by recursively calling RowUI  */}
      {row.subRows.length > 0 &&
        row.subRows.map((subRow) => {
          return <RowUI row={subRow} prepareRow={prepareRow} />;
        })}
    </>
  );
};
