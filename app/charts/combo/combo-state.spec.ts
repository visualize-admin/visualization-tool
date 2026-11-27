import { describe, expect, it } from "vitest";

import { groupByX } from "@/charts/combo/combo-state";
import { Observation } from "@/domain/data";

const OBSERVATIONS: readonly Observation[] = Object.freeze([
  { year: "2022", value: 2 },
  { year: "2020", value: 1 },
  { year: "2022", value: 3 },
]);

describe("groupByX", () => {
  it("groups observations by x in date order without changing the input", () => {
    const grouped = groupByX({
      chartData: OBSERVATIONS,
      getXAsDate: (d) => new Date(`${d.year}-01-01`),
      getXAsString: (d) => `${d.year}`,
    });

    expect(grouped.map(([x, values]) => [x, values.length])).toEqual([
      ["2020", 1],
      ["2022", 2],
    ]);
    expect(OBSERVATIONS.map((d) => d.year)).toEqual(["2022", "2020", "2022"]);
  });
});
