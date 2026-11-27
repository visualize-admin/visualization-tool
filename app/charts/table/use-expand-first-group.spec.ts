import { renderHook } from "@testing-library/react";
import { Row } from "react-table";
import { describe, expect, it, vi } from "vitest";

import {
  getFirstGroupPath,
  useExpandFirstGroup,
} from "@/charts/table/use-expand-first-group";
import { Observation } from "@/domain/data";

describe("getFirstGroupPath", () => {
  it("returns the first group at every grouping level", () => {
    const rows = makeRows();

    expect(getFirstGroupPath(rows).map((row) => row.id)).toEqual([
      "canton:Zurich",
      "canton:Zurich>region:Zurich",
    ]);
  });

  it("returns nothing for a table without groups", () => {
    expect(getFirstGroupPath([leaf("0"), leaf("1")])).toEqual([]);
  });

  it("returns nothing for an empty table", () => {
    expect(getFirstGroupPath([])).toEqual([]);
  });
});

describe("useExpandFirstGroup", () => {
  it("waits for rows, then opens the first group path once", () => {
    const rows = makeRows();
    const prepareRow = vi.fn();
    const { rerender } = renderHook(
      ({ rows }) =>
        useExpandFirstGroup({
          rows,
          prepareRow,
          enabled: true,
          groupingIds: ["canton", "region"],
        }),
      { initialProps: { rows: [] as Row<Observation>[] } }
    );
    expect(prepareRow).not.toHaveBeenCalled();

    rerender({ rows });
    rerender({ rows: [...rows] });

    expect(expandCalls(rows)).toEqual([
      ["canton:Zurich", true],
      ["canton:Zurich>region:Zurich", true],
    ]);
  });

  it("closes the groups it opened when the setting is turned off", () => {
    const rows = makeRows();
    const { rerender } = renderHook(
      ({ enabled }) =>
        useExpandFirstGroup({
          rows,
          prepareRow: vi.fn(),
          enabled,
          groupingIds: ["canton", "region"],
        }),
      { initialProps: { enabled: true } }
    );

    rerender({ enabled: false });

    expect(expandCalls(rows)).toEqual([
      ["canton:Zurich", true],
      ["canton:Zurich>region:Zurich", true],
      ["canton:Zurich", false],
      ["canton:Zurich>region:Zurich", false],
    ]);
  });

  it("reopens the first group path when the grouping changes", () => {
    const rows = makeRows();
    const { rerender } = renderHook(
      ({ groupingIds }) =>
        useExpandFirstGroup({
          rows,
          prepareRow: vi.fn(),
          enabled: true,
          groupingIds,
        }),
      { initialProps: { groupingIds: ["canton", "region"] } }
    );

    rerender({ groupingIds: ["canton", "region"] });

    expect(expandCalls(rows)).toHaveLength(2);

    rerender({ groupingIds: ["region", "canton"] });

    expect(expandCalls(rows)).toEqual([
      ["canton:Zurich", true],
      ["canton:Zurich>region:Zurich", true],
      ["canton:Zurich", false],
      ["canton:Zurich>region:Zurich", false],
      ["canton:Zurich", true],
      ["canton:Zurich>region:Zurich", true],
    ]);
  });

  it("does nothing while the setting is off", () => {
    const rows = makeRows();
    renderHook(() =>
      useExpandFirstGroup({
        rows,
        prepareRow: vi.fn(),
        enabled: false,
        groupingIds: ["canton"],
      })
    );

    expect(expandCalls(rows)).toEqual([]);
  });
});

const calls: [string, boolean][] = [];

const group = (id: string, subRows: Row<Observation>[]) =>
  ({
    id,
    isGrouped: true,
    subRows,
    toggleRowExpanded: (value: boolean) => calls.push([id, value]),
  }) as unknown as Row<Observation>;

const leaf = (id: string) =>
  ({ id, isGrouped: false, subRows: [] }) as unknown as Row<Observation>;

const makeRows = () => {
  calls.length = 0;

  return [
    group("canton:Zurich", [
      group("canton:Zurich>region:Zurich", [leaf("0"), leaf("1")]),
      group("canton:Zurich>region:Winterthur", [leaf("2")]),
    ]),
    group("canton:Bern", [leaf("3")]),
  ];
};

const expandCalls = (_rows: Row<Observation>[]) => [...calls];
