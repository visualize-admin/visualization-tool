import { useEffect, useRef } from "react";
import { Row } from "react-table";

import { Observation } from "@/domain/data";
import { useStableIds } from "@/utils/use-stable-ids";

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
  const ids = useStableIds(groupingIds);
  const applied = useRef<{ enabled: boolean; ids: string[] }>();
  const openedRows = useRef<Row<Observation>[]>([]);

  useEffect(() => {
    if (
      (applied.current?.enabled === enabled && applied.current.ids === ids) ||
      rows.length === 0
    ) {
      return;
    }

    applied.current = { enabled, ids };

    for (const row of openedRows.current) {
      row.toggleRowExpanded(false);
    }

    openedRows.current = enabled ? getFirstGroupPath(rows) : [];

    for (const row of openedRows.current) {
      // Nested rows get their methods only once they are prepared.
      prepareRow(row);
      row.toggleRowExpanded(true);
    }
  }, [enabled, ids, rows, prepareRow]);
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
