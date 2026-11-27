import { beforeEach, describe, expect, it, vi } from "vitest";

import { getNaturalColumnWidth } from "@/charts/table/natural-column-width";
import { Component, Observation } from "@/domain/data";
import { getTextWidth } from "@/utils/get-text-width";

vi.mock("@/utils/get-text-width", () => ({
  getTextWidth: vi.fn((text: string) => text.length * 10),
}));

const CANTON = {
  __typename: "NominalDimension",
  id: "canton",
  label: "Canton",
} as Component;

const VOTES = {
  __typename: "NumericalMeasure",
  id: "votes",
  label: "Votes",
} as Component;

const OBSERVATIONS: Observation[] = [
  { canton: "Zurich", votes: 12 },
  { canton: "Graubünden", votes: 1234567 },
  { canton: "Zurich", votes: 3 },
];

describe("getNaturalColumnWidth", () => {
  beforeEach(() => {
    vi.mocked(getTextWidth).mockClear();
  });

  it("fits the longest value", () => {
    expect(
      getNaturalColumnWidth({
        component: CANTON,
        observations: OBSERVATIONS,
        formatNumber,
      })
    ).toBe("Graubünden".length * 10 + 20);
  });

  it("fits the header when it is wider than the values", () => {
    expect(
      getNaturalColumnWidth({
        component: { ...CANTON, label: "Canton of residence" },
        observations: OBSERVATIONS,
        formatNumber,
      })
    ).toBe("Canton of residence".length * 10 + 44);
  });

  it("is at least 50px wide", () => {
    expect(
      getNaturalColumnWidth({
        component: { ...CANTON, label: "" },
        observations: [{ canton: "a" }],
        formatNumber,
      })
    ).toBe(50);
  });

  it("measures numbers as they are formatted", () => {
    expect(
      getNaturalColumnWidth({
        component: VOTES,
        observations: OBSERVATIONS,
        formatNumber,
      })
    ).toBe("<1234567>".length * 10 + 20);
  });

  it("measures each distinct value once", () => {
    getNaturalColumnWidth({
      component: CANTON,
      observations: OBSERVATIONS,
      formatNumber,
    });

    expect(getTextWidth).toHaveBeenCalledTimes(3);
  });
});

const formatNumber = (value: number) => `<${value}>`;
