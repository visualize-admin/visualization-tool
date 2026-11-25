import { Row } from "react-table";
import { describe, expect, it } from "vitest";

import {
  makeCategoryColorScale,
  makeColumnSortType,
} from "@/charts/table/column-helpers";
import { Component, Observation } from "@/domain/data";

const CANTONS = {
  __typename: "NominalDimension",
  id: "canton",
  values: [
    { value: "zh", label: "Zurich", alternateName: "ZH", position: 2 },
    { value: "be", label: "Bern", alternateName: "BE", position: 1 },
    { value: "ag", label: "Aargau", alternateName: "AG", position: 3 },
  ],
} as unknown as Component;

describe("makeColumnSortType", () => {
  it("sorts abbreviated values by their dimension value position", () => {
    const sortType = makeColumnSortType({
      component: CANTONS,
      useAbbreviations: true,
    });
    const rows = ["ZH", "AG", "BE"].map(makeRow);

    expect(
      [...rows]
        .sort((a, b) => sortType(a, b, "canton"))
        .map((row) => row.values.canton)
    ).toEqual(["BE", "ZH", "AG"]);
  });
});

describe("makeCategoryColorScale", () => {
  it("maps abbreviated values to the configured colors", () => {
    const colorScale = makeCategoryColorScale({
      dimension: CANTONS,
      colorMapping: { zh: "#111111", be: "#222222" },
      useAbbreviations: true,
    });

    expect(colorScale("BE")).toBe("#222222");
    expect(colorScale("ZH")).toBe("#111111");
  });

  it("maps labels to the configured colors without abbreviations", () => {
    const colorScale = makeCategoryColorScale({
      dimension: CANTONS,
      colorMapping: { zh: "#111111" },
      useAbbreviations: false,
    });

    expect(colorScale("Zurich")).toBe("#111111");
  });
});

const makeRow = (canton: string) => {
  return { values: { canton } } as unknown as Row<Observation>;
};
