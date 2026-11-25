import { useEffect, useRef } from "react";
import { Row } from "react-table";

import { Observation } from "@/domain/data";

export const useExpandFirstGroup = ({
  rows,
  prepareRow,
  enabled,
  groupingIds,
}: {
  rows: Row<Observation>[];
  prepareRow: (row: Row<Observation>) => void;
  enabled: boolean;
  groupingIds: string[];
}) => {
  const appliedKey = useRef<string>();
  const openedRows = useRef<Row<Observation>[]>([]);
  const key = `${enabled}:${groupingIds.join(",")}`;

  useEffect(() => {
    if (appliedKey.current === key || rows.length === 0) {
      return;
    }

    appliedKey.current = key;

    for (const row of openedRows.current) {
      row.toggleRowExpanded(false);
    }

    openedRows.current = enabled ? getFirstGroupPath(rows) : [];

    for (const row of openedRows.current) {
      // Nested rows get their methods only once they are prepared.
      prepareRow(row);
      row.toggleRowExpanded(true);
    }
  }, [key, enabled, rows, prepareRow]);
};

export const getFirstGroupPath = (rows: Row<Observation>[]) => {
  const path: Row<Observation>[] = [];
  let row = rows[0];

  while (row?.isGrouped) {
    path.push(row);
    row = row.subRows[0];
  }

  return path;
};
