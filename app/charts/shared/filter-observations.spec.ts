import { describe, expect, it } from "vitest";

import { filterObservations } from "@/charts/shared/filter-observations";
import { Observation } from "@/domain/data";

const OBSERVATIONS: Observation[] = [
  { canton: "Zurich", year: 2020 },
  { canton: "Zurich", year: 2024 },
  { canton: "Bern", year: 2024 },
];

describe("filterObservations", () => {
  it("returns the same array when nothing filters it", () => {
    expect(filterObservations(OBSERVATIONS, [])).toBe(OBSERVATIONS);
  });

  it("keeps observations that match every predicate", () => {
    expect(
      filterObservations(OBSERVATIONS, [
        (d) => d.canton === "Zurich",
        (d) => (d.year as number) > 2020,
      ])
    ).toEqual([{ canton: "Zurich", year: 2024 }]);
  });
});
