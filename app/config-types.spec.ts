import { describe, expect, it } from "vitest";

import { getChartConfigFilters } from "@/config-utils";

describe("getChartConfigFilters", () => {
  it("should return filters for a specific cube with joinBy (joined = true)", () => {
    const result = getChartConfigFilters(
      [
        {
          iri: "cube1",
          joinBy: ["dimension1"],
          filters: {
            dimension1: { type: "single", value: "value1" },
            dimension2: { type: "single", value: "value2" },
          },
        },
        {
          iri: "cube2",
          joinBy: ["dimension3"],
          filters: {
            dimension3: { type: "single", value: "value1" },
            dimension4: { type: "single", value: "value4" },
          },
        },
      ],
      {
        joined: true,
      }
    );

    expect(result).toEqual({
      joinBy__0: { type: "single", value: "value1" },
      dimension2: { type: "single", value: "value2" },
      dimension4: { type: "single", value: "value4" },
    });
  });

  it("should return filters for a specific cube without joinBy (joined = true)", () => {
    const result = getChartConfigFilters(
      [
        {
          iri: "cube1",
          joinBy: [],
          filters: {
            dimension1: { type: "single", value: "value1" },
            dimension2: { type: "single", value: "value2" },
          },
        },
        {
          iri: "cube2",
          joinBy: [],
          filters: {
            dimension3: { type: "single", value: "value3" },
            dimension4: { type: "single", value: "value4" },
          },
        },
      ],
      {
        joined: true,
      }
    );

    expect(result).toEqual({
      dimension1: { type: "single", value: "value1" },
      dimension2: { type: "single", value: "value2" },
      dimension3: { type: "single", value: "value3" },
      dimension4: { type: "single", value: "value4" },
    });
  });

  it("should return filters for a specific cube with more than 1 joinBy (joined = true)", () => {
    const result = getChartConfigFilters(
      [
        {
          iri: "cube1",
          joinBy: ["dimension1", "dimension2"],
          filters: {
            dimension1: { type: "single", value: "value1" },
            dimension2: { type: "single", value: "value2" },
          },
        },
        {
          iri: "cube2",
          joinBy: ["dimension3", "dimension4"],
          filters: {
            dimension3: { type: "single", value: "value1" },
            dimension4: { type: "single", value: "value2" },
          },
        },
      ],
      {
        joined: true,
      }
    );

    expect(result).toEqual({
      joinBy__0: { type: "single", value: "value1" },
      joinBy__1: { type: "single", value: "value2" },
    });
  });

  it("should return filters for a specific cube with more than 1 joinBy (joined = false)", () => {
    const result = getChartConfigFilters([
      {
        iri: "cube1",
        joinBy: ["dimension1", "dimension2"],
        filters: {
          dimension1: { type: "single", value: "value1" },
          dimension2: { type: "single", value: "value2" },
        },
      },
      {
        iri: "cube2",
        joinBy: ["dimension3", "dimension4"],
        filters: {
          dimension3: { type: "single", value: "value1" },
          dimension4: { type: "single", value: "value2" },
        },
      },
    ]);

    expect(result).toEqual({
      dimension1: { type: "single", value: "value1" },
      dimension2: { type: "single", value: "value2" },
      dimension3: { type: "single", value: "value1" },
      dimension4: { type: "single", value: "value2" },
    });
  });
});
