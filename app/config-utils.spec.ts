import { describe, expect, it } from "vitest";

import { Filters } from "@/config-types";
import {
  extractSingleFilters,
  getChartConfigFilters,
  makeMultiFilter,
} from "@/config-utils";

describe("Config Utils", () => {
  describe("makeMultiFilter", () => {
    it("should create multi filter from array of values", () => {
      const values = ["value1", "value2", "value3"];
      const result = makeMultiFilter(values);

      expect(result).toEqual({
        type: "multi",
        values: {
          value1: true,
          value2: true,
          value3: true,
        },
      });
    });

    it("should handle empty array", () => {
      const values: string[] = [];
      const result = makeMultiFilter(values);

      expect(result).toEqual({
        type: "multi",
        values: {},
      });
    });

    it("should handle single value", () => {
      const values = ["single-value"];
      const result = makeMultiFilter(values);

      expect(result).toEqual({
        type: "multi",
        values: {
          "single-value": true,
        },
      });
    });

    it("should handle duplicate values", () => {
      const values = ["value1", "value1", "value2"];
      const result = makeMultiFilter(values);

      expect(result).toEqual({
        type: "multi",
        values: {
          value1: true,
          value2: true,
        },
      });
    });
  });

  describe("extractSingleFilters", () => {
    it("should extract only single filters", () => {
      const filters: Filters = {
        dimension1: { type: "single", value: "value1" },
        dimension2: { type: "multi", values: { value2: true } },
        dimension3: { type: "single", value: "value3" },
        dimension4: { type: "range", from: "2021-01-01", to: "2021-12-31" },
      };

      const result = extractSingleFilters(filters);

      expect(result).toEqual({
        dimension1: { type: "single", value: "value1" },
        dimension3: { type: "single", value: "value3" },
      });
    });

    it("should return empty object when no single filters", () => {
      const filters: Filters = {
        dimension1: { type: "multi", values: { value1: true } },
        dimension2: { type: "range", from: "2021-01-01", to: "2021-12-31" },
      };

      const result = extractSingleFilters(filters);

      expect(result).toEqual({});
    });

    it("should handle empty filters object", () => {
      const filters: Filters = {};

      const result = extractSingleFilters(filters);

      expect(result).toEqual({});
    });
  });

  describe("getChartConfigFilters", () => {
    const mockCubes = [
      {
        iri: "cube1",
        filters: {
          dimension1: { type: "single" as const, value: "value1" },
          dimension2: { type: "single" as const, value: "value2" },
        },
        joinBy: [],
      },
      {
        iri: "cube2",
        filters: {
          dimension3: { type: "single" as const, value: "value3" },
          dimension4: { type: "multi" as const, values: { value4: true } },
        },
        joinBy: [],
      },
    ] as any;

    it("should get all filters from all cubes", () => {
      const result = getChartConfigFilters(mockCubes);

      expect(result).toEqual({
        dimension1: { type: "single", value: "value1" },
        dimension2: { type: "single", value: "value2" },
        dimension3: { type: "single", value: "value3" },
        dimension4: { type: "multi", values: { value4: true } },
      });
    });

    it("should get filters for specific cube", () => {
      const result = getChartConfigFilters(mockCubes, { cubeIri: "cube1" });

      expect(result).toEqual({
        dimension1: { type: "single", value: "value1" },
        dimension2: { type: "single", value: "value2" },
      });
    });

    it("should return empty object for non-existent cube", () => {
      const result = getChartConfigFilters(mockCubes, {
        cubeIri: "non-existent",
      });

      expect(result).toEqual({});
    });

    it("should handle joined dimensions", () => {
      const cubesWithJoin = [
        {
          iri: "cube1",
          filters: {
            dimension1: { type: "single" as const, value: "value1" },
          },
          joinBy: ["join1", "join2"],
        },
      ] as any;

      const result = getChartConfigFilters(cubesWithJoin, { joined: true });

      expect(result).toEqual({
        dimension1: { type: "single", value: "value1" },
      });
    });

    it("should handle empty cubes array", () => {
      const result = getChartConfigFilters([]);

      expect(result).toEqual({});
    });

    it("should handle cubes with no filters", () => {
      const cubesWithoutFilters = [
        {
          iri: "cube1",
          filters: {},
          joinBy: [],
        },
      ];

      const result = getChartConfigFilters(cubesWithoutFilters);

      expect(result).toEqual({});
    });
  });
});
