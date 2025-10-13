import { describe, expect, it } from "vitest";

import { ChartConfig } from "@/config-types";

import { getPotentialDataFilterIds } from "./interactive-filters";

describe("getPotentialDataFilterIds", () => {
  describe("non-table chart configurations", () => {
    it("should return empty array when no charts have filters", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {},
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual([]);
    });

    it("should return empty array when only one chart has filters", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
                dimension2: { type: "multi", values: ["value1", "value2"] },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual([]);
    });

    it("should return shared dimension IDs when multiple charts have the same filters", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
                dimension2: { type: "multi", values: ["value1", "value2"] },
                dimension3: { type: "range", from: 0, to: 100 }, // Should be excluded
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "single", value: "value2" },
                dimension4: { type: "multi", values: ["value3"] },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1"]);
    });

    it("should handle multiple cubes per chart", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
              },
            },
            {
              iri: "cube2",
              filters: {
                dimension2: { type: "multi", values: ["value1"] },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube3",
              filters: {
                dimension1: { type: "single", value: "value2" },
                dimension2: { type: "multi", values: ["value2"] },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1", "dimension2"]);
    });

    it("should filter out non-single and non-multi filter types", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
                dimension2: { type: "range", from: 0, to: 100 },
                dimension3: { type: "checkbox", checked: true },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "multi", values: ["value1"] },
                dimension2: { type: "range", from: 10, to: 50 },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1"]);
    });
  });

  describe("table chart configurations", () => {
    it("should include table fields that can be multi-filtered", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "table",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
              },
            },
          ],
          fields: {
            field1: { componentType: "NominalDimension" },
            field2: { componentType: "Measure" },
            field3: { componentType: "OrdinalDimension" },
          },
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "line",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "multi", values: ["value1"] },
                field1: { type: "single", value: "value2" },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1", "field1"]);
    });

    it("should not include table fields that cannot be multi-filtered", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "table",
          cubes: [
            {
              iri: "cube1",
              filters: {},
            },
          ],
          fields: {
            field1: { componentType: "Measure" },
            field2: { componentType: "TemporalDimension" },
            field3: { componentType: "GeoDimension" },
          },
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "table",
          cubes: [
            {
              iri: "cube2",
              filters: {},
            },
          ],
          fields: {
            field1: { componentType: "Measure" },
          },
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual([]);
    });

    it("should combine table fields with cube filters for table charts", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "table",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
                dimension2: { type: "multi", values: ["value1"] },
              },
            },
          ],
          fields: {
            field1: { componentType: "NominalDimension" },
            field2: { componentType: "TemporalOrdinalDimension" },
          },
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "single", value: "value2" },
                field1: { type: "multi", values: ["value2"] },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1", "field1"]);
    });
  });

  describe("edge cases and complex scenarios", () => {
    it("should handle empty chart configs array", () => {
      const result = getPotentialDataFilterIds([]);
      expect(result).toEqual([]);
    });

    it("should handle charts with empty cubes array", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual([]);
    });

    it("should handle charts with empty filters", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [{ iri: "cube1", filters: {} }],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual([]);
    });

    it("should deduplicate dimension IDs within the same chart", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
              },
            },
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "multi", values: ["value1"] },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube3",
              filters: {
                dimension1: { type: "single", value: "value2" },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1"]);
    });

    it("should handle mixed chart types with complex filter combinations", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "table",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
                dimension2: { type: "multi", values: ["value1"] },
              },
            },
          ],
          fields: {
            field1: { componentType: "NominalDimension" },
            field2: { componentType: "Measure" },
            dimension1: { componentType: "OrdinalDimension" },
          },
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "line",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "single", value: "value2" },
                dimension3: { type: "multi", values: ["value2"] },
                field1: { type: "single", value: "value3" },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart3",
          chartType: "table",
          cubes: [
            {
              iri: "cube3",
              filters: {
                dimension4: { type: "single", value: "value4" },
              },
            },
          ],
          fields: {
            field1: { componentType: "NominalDimension" },
            field3: { componentType: "TemporalOrdinalDimension" },
          },
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1", "field1"]);
    });

    it("should handle charts where shared dimensions appear more than twice", () => {
      const chartConfigs: ChartConfig[] = [
        {
          key: "chart1",
          chartType: "line",
          cubes: [
            {
              iri: "cube1",
              filters: {
                dimension1: { type: "single", value: "value1" },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart2",
          chartType: "bar",
          cubes: [
            {
              iri: "cube2",
              filters: {
                dimension1: { type: "multi", values: ["value1"] },
              },
            },
          ],
        } as any as ChartConfig,
        {
          key: "chart3",
          chartType: "pie",
          cubes: [
            {
              iri: "cube3",
              filters: {
                dimension1: { type: "single", value: "value2" },
                dimension2: { type: "multi", values: ["value2"] },
              },
            },
          ],
        } as any as ChartConfig,
      ];

      const result = getPotentialDataFilterIds(chartConfigs);
      expect(result).toEqual(["dimension1"]);
    });
  });
});
