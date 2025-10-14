import { CubeDimension } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import ParsingClient from "sparql-http-client/ParsingClient";
import { describe, expect, it, vi } from "vitest";

import { Filters, FilterValue } from "@/config-types";
import * as ns from "@/rdf/namespace";
import {
  getFiltersList,
  getQueryFilters,
  loadDimensionValuesWithMetadata,
} from "@/rdf/query-dimension-values";

vi.mock("./extended-cube", () => ({}));

const cubeDimensions = [
  {
    path: rdf.namedNode("http://example.com/dimension1"),
    out: (_: string) => {
      return { list: () => [] };
    },
  },
  {
    path: rdf.namedNode("http://example.com/dimension2"),
    out: (_: string) => {
      return { list: () => [] };
    },
  },
] as any as CubeDimension[];

describe("getDimensionValuesWithMetadata", () => {
  const dimensionIri = cubeDimensions[0].path?.value!;
  const quads = [
    rdf.quad(
      rdf.blankNode(),
      ns.rdf.first,
      rdf.namedNode("http://example.com/value1")
    ),
    rdf.quad(
      rdf.namedNode("http://example.com/value1"),
      ns.schema.name,
      rdf.literal("Value 1")
    ),
    rdf.quad(
      rdf.namedNode("http://example.com/value1"),
      ns.schema.description,
      rdf.literal("Description 1")
    ),
    rdf.quad(
      rdf.namedNode("http://example.com/value1"),
      ns.schema.alternateName,
      rdf.literal("Alternate 1")
    ),
    rdf.quad(rdf.blankNode(), ns.rdf.first, ns.cube.Undefined),
  ];
  const sparqlClient = {
    query: {
      construct: async () => Promise.resolve(quads),
      endpoint: {
        endpointUrl: "fake-url",
      },
    },
  } as any as ParsingClient;

  it("should return the values of a dimension", async () => {
    const values = await loadDimensionValuesWithMetadata("", {
      cubeDimensions,
      dimensionIri,
      sparqlClient,
      locale: "en",
      cache: undefined,
    });
    expect(values).toEqual([
      {
        value: "http://example.com/value1",
        label: "Value 1",
        description: "Description 1",
        alternateName: "Alternate 1",
      },
      {
        value: ns.cube.Undefined.value,
        label: "-",
      },
    ]);
  });
});

describe("getQueryFilters", () => {
  const filters: [string, FilterValue][] = [
    ["http://example.com/dimension1", { type: "single", value: "value1" }],
  ];

  it("should include other dimensions in the returning part of the query", async () => {
    const queryPart = getQueryFilters(
      filters,
      cubeDimensions,
      "http://example.com/dimension2"
    );
    expect(queryPart).toContain("<http://example.com/dimension1>");
  });
});

describe("getFiltersList", () => {
  describe("when no filters are provided", () => {
    it("should return empty array for undefined filters", () => {
      const result = getFiltersList(undefined, "http://example.com/dimension1");
      expect(result).toEqual([]);
    });

    it("should return empty array for empty filters object", () => {
      const result = getFiltersList({}, "http://example.com/dimension1");
      expect(result).toEqual([]);
    });
  });

  describe("normal usage pattern (full filter set)", () => {
    const filters: Filters = {
      "http://example.com/dimension1": { type: "single", value: "value1" },
      "http://example.com/dimension2": { type: "single", value: "value2" },
      "http://example.com/dimension3": {
        type: "multi",
        values: { value3a: true, value3b: true },
      },
      "http://example.com/dimension4": { type: "single", value: "value4" },
    };

    it("should return filters before the current dimension (first dimension)", () => {
      const result = getFiltersList(filters, "http://example.com/dimension1");
      expect(result).toEqual([]);
    });

    it("should return filters before the current dimension (middle dimension)", () => {
      const result = getFiltersList(filters, "http://example.com/dimension3");
      expect(result).toEqual([
        ["http://example.com/dimension1", { type: "single", value: "value1" }],
        ["http://example.com/dimension2", { type: "single", value: "value2" }],
      ]);
    });

    it("should return filters before the current dimension (last dimension)", () => {
      const result = getFiltersList(filters, "http://example.com/dimension4");
      expect(result).toEqual([
        ["http://example.com/dimension1", { type: "single", value: "value1" }],
        ["http://example.com/dimension2", { type: "single", value: "value2" }],
        [
          "http://example.com/dimension3",
          { type: "multi", values: { value3a: true, value3b: true } },
        ],
      ]);
    });

    it("should handle mixed filter types correctly", () => {
      const mixedFilters: Filters = {
        "http://example.com/filter1": { type: "single", value: "single_value" },
        "http://example.com/filter2": {
          type: "multi",
          values: { multi1: true, multi2: true },
        },
        "http://example.com/filter3": {
          type: "range",
          from: "2020",
          to: "2023",
        },
        "http://example.com/current": {
          type: "single",
          value: "current_value",
        },
      };

      const result = getFiltersList(mixedFilters, "http://example.com/current");
      expect(result).toEqual([
        [
          "http://example.com/filter1",
          { type: "single", value: "single_value" },
        ],
        [
          "http://example.com/filter2",
          { type: "multi", values: { multi1: true, multi2: true } },
        ],
        [
          "http://example.com/filter3",
          { type: "range", from: "2020", to: "2023" },
        ],
      ]);
    });
  });

  describe("pre-sliced usage pattern (DataFilterSelectGeneric)", () => {
    const preSlicedFilters: Filters = {
      "http://example.com/constraint1": { type: "single", value: "value1" },
      "http://example.com/constraint2": {
        type: "multi",
        values: { value2a: true, value2b: true },
      },
    };

    it("should return all filters when current dimension is not found (pre-sliced case)", () => {
      const result = getFiltersList(
        preSlicedFilters,
        "http://example.com/target_dimension"
      );
      expect(result).toEqual([
        ["http://example.com/constraint1", { type: "single", value: "value1" }],
        [
          "http://example.com/constraint2",
          { type: "multi", values: { value2a: true, value2b: true } },
        ],
      ]);
    });

    it("should preserve filter order when using all filters", () => {
      const orderedFilters: Filters = {
        "http://example.com/first": { type: "single", value: "first_value" },
        "http://example.com/second": { type: "single", value: "second_value" },
        "http://example.com/third": { type: "single", value: "third_value" },
      };

      const result = getFiltersList(
        orderedFilters,
        "http://example.com/not_found"
      );
      expect(result).toEqual([
        ["http://example.com/first", { type: "single", value: "first_value" }],
        [
          "http://example.com/second",
          { type: "single", value: "second_value" },
        ],
        ["http://example.com/third", { type: "single", value: "third_value" }],
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle single filter correctly", () => {
      const singleFilter: Filters = {
        "http://example.com/only_filter": {
          type: "single",
          value: "only_value",
        },
      };

      const result = getFiltersList(
        singleFilter,
        "http://example.com/not_found"
      );
      expect(result).toEqual([
        [
          "http://example.com/only_filter",
          { type: "single", value: "only_value" },
        ],
      ]);
    });

    it("should return empty array when current dimension is the only filter", () => {
      const singleFilter: Filters = {
        "http://example.com/current": {
          type: "single",
          value: "current_value",
        },
      };

      const result = getFiltersList(singleFilter, "http://example.com/current");
      expect(result).toEqual([]);
    });

    it("should handle filters with special characters in IRIs", () => {
      const specialFilters: Filters = {
        "https://example.com/path/to/dimension?param=1": {
          type: "single",
          value: "value1",
        },
        "https://example.com/path/to/dimension#fragment": {
          type: "single",
          value: "value2",
        },
      };

      const result = getFiltersList(
        specialFilters,
        "http://example.com/target"
      );
      expect(result).toEqual([
        [
          "https://example.com/path/to/dimension?param=1",
          { type: "single", value: "value1" },
        ],
        [
          "https://example.com/path/to/dimension#fragment",
          { type: "single", value: "value2" },
        ],
      ]);
    });
  });
});
