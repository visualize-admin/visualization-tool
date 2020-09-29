import { Box, Button } from "@theme-ui/components";
import * as React from "react";

export const CellUI = ({
  cell,
  children,
}: {
  cell: $FixMe;
  children: React.ReactNode;
}) => (
  <td
    style={{
      background: cell.isGrouped
        ? "#0aff0082"
        : cell.isAggregated
        ? "#ffa50078"
        : cell.isPlaceholder
        ? "#ff000042"
        : "white",
    }}
    {...cell.getCellProps()}
  >
    {children}
  </td>
);
