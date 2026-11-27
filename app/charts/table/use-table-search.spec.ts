import { renderHook } from "@testing-library/react";
import FlexSearch from "flexsearch";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TableChartState } from "@/charts/table/table-state";
import { useTableSearch } from "@/charts/table/use-table-search";
import { Component, Observation } from "@/domain/data";

const OBSERVATIONS: Observation[] = [
  { id: 0, title: "Volksinitiative für sauberes Wasser", votes: "1234" },
  { id: 1, title: "Direkter Gegenvorschlag", votes: "5678" },
];

const TABLE_COLUMNS_META = {
  title: {
    slugifiedId: "title",
    dim: { __typename: "NominalDimension", id: "title" } as Component,
  },
  votes: {
    slugifiedId: "votes",
    dim: { __typename: "NumericalMeasure", id: "votes" } as Component,
  },
} as unknown as TableChartState["tableColumnsMeta"];

describe("useTableSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns all rows without building an index until something is searched", () => {
    const create = vi.spyOn(FlexSearch, "create");
    const { result } = renderSearch("");

    expect(result.current).toBe(OBSERVATIONS);
    expect(create).not.toHaveBeenCalled();
  });

  it("finds rows by a part of a word", () => {
    const { result } = renderSearch("initiative");

    expect(result.current).toEqual([OBSERVATIONS[0]]);
  });

  it("does not search number columns", () => {
    const { result } = renderSearch("1234");

    expect(result.current).toEqual([]);
  });

  it("keeps the index after the search is cleared", () => {
    const create = vi.spyOn(FlexSearch, "create");
    const { result, rerender } = renderSearch("Gegen");
    rerender({ searchTerm: "" });

    expect(result.current).toBe(OBSERVATIONS);

    rerender({ searchTerm: "Wasser" });

    expect(result.current).toEqual([OBSERVATIONS[0]]);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("keeps the index when column options change but searched columns don't", () => {
    const create = vi.spyOn(FlexSearch, "create");
    const { rerender } = renderHook(
      (props: { meta: TableChartState["tableColumnsMeta"] }) =>
        useTableSearch({
          observations: OBSERVATIONS,
          tableColumnsMeta: props.meta,
          searchTerm: "Gegen",
        }),
      { initialProps: { meta: TABLE_COLUMNS_META } }
    );
    rerender({ meta: { ...TABLE_COLUMNS_META } });

    expect(create).toHaveBeenCalledTimes(1);
  });

  it("searches new rows after the data changes", () => {
    const { result, rerender } = renderHook(
      (props: { observations: Observation[] }) =>
        useTableSearch({
          observations: props.observations,
          tableColumnsMeta: TABLE_COLUMNS_META,
          searchTerm: "Wasser",
        }),
      { initialProps: { observations: OBSERVATIONS } }
    );
    const added = { id: 2, title: "Wasser für alle", votes: "1" };
    rerender({ observations: [...OBSERVATIONS, added] });

    expect(result.current).toHaveLength(2);
    expect(result.current).toEqual(
      expect.arrayContaining([OBSERVATIONS[0], added])
    );
  });

  it("rebuilds the index when the searched columns change", () => {
    const create = vi.spyOn(FlexSearch, "create");
    const { rerender } = renderHook(
      (props: { meta: TableChartState["tableColumnsMeta"] }) =>
        useTableSearch({
          observations: OBSERVATIONS,
          tableColumnsMeta: props.meta,
          searchTerm: "Gegen",
        }),
      { initialProps: { meta: TABLE_COLUMNS_META } }
    );
    rerender({
      meta: {
        ...TABLE_COLUMNS_META,
        votes: {
          ...TABLE_COLUMNS_META.votes,
          dim: { __typename: "NominalDimension", id: "votes" } as Component,
        },
      },
    });

    expect(create).toHaveBeenCalledTimes(2);
  });

  it("builds the index once while the search term changes", () => {
    const create = vi.spyOn(FlexSearch, "create");
    const { result, rerender } = renderSearch("Gegen");
    rerender({ searchTerm: "Gegenvorschlag" });

    expect(result.current).toEqual([OBSERVATIONS[1]]);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

const renderSearch = (searchTerm: string) => {
  return renderHook(
    (props: { searchTerm: string }) =>
      useTableSearch({
        observations: OBSERVATIONS,
        tableColumnsMeta: TABLE_COLUMNS_META,
        searchTerm: props.searchTerm,
      }),
    { initialProps: { searchTerm } }
  );
};
