import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SingleFilters } from "@/config-types";
import { isMostRecentValue } from "@/domain/most-recent-value";

import { getQueryFilters } from "./query-possible-filters";

vi.mock("@/domain/most-recent-value", () => ({
  isMostRecentValue: vi.fn(),
}));

vi.mock("./query-dimension-values", () => ({
  loadMaxDimensionValue: vi.fn().mockImplementation(() => {
    return Promise.resolve("2023-12-31");
  }),
}));

describe("Query Possible Filters", () => {
  describe("getQueryFilters", () => {
    const mockSparqlClient = {
      query: vi.fn(),
      store: {},
    } as unknown as ParsingClient;

    const mockCache = {
      get: vi.fn(),
      set: vi.fn(),
    } as unknown as LRUCache<string, unknown>;

    const mockDimensionsMetadata = [
      {
        iri: "dimension1",
        isVersioned: false,
        isLiteral: false,
      },
      {
        iri: "dimension2",
        isVersioned: true,
        isLiteral: false,
      },
      {
        iri: "dimension3",
        isVersioned: false,
        isLiteral: true,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(isMostRecentValue).mockReturnValue(false);
    });

    it("should create query filters for single filters", async () => {
      const filters: SingleFilters = {
        dimension1: { type: "single", value: "value1" },
        dimension2: { type: "single", value: "value2" },
      };

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        i: 0,
        iri: "dimension1",
        value: "value1",
        isVersioned: false,
        isLiteral: false,
      });
      expect(result[1]).toEqual({
        i: 1,
        iri: "dimension2",
        value: "value2",
        isVersioned: true,
        isLiteral: false,
      });
    });

    it("should handle most recent value", async () => {
      const filters: SingleFilters = {
        dimension1: { type: "single", value: "most-recent" },
      };

      vi.mocked(isMostRecentValue).mockReturnValue(true);

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe("2023-12-31");
    });

    it("should handle empty filters", async () => {
      const filters: SingleFilters = {};

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(0);
    });

    it("should handle filters with missing metadata", async () => {
      const filters: SingleFilters = {
        "unknown-dimension": { type: "single", value: "value1" },
      };

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        i: 0,
        iri: "unknown-dimension",
        value: "value1",
        isVersioned: false,
        isLiteral: false,
      });
    });

    it("should handle literal dimensions", async () => {
      const filters: SingleFilters = {
        dimension3: { type: "single", value: "literal-value" },
      };

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        i: 0,
        iri: "dimension3",
        value: "literal-value",
        isVersioned: false,
        isLiteral: true,
      });
    });

    it("should handle versioned dimensions", async () => {
      const filters: SingleFilters = {
        dimension2: { type: "single", value: "versioned-value" },
      };

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        i: 0,
        iri: "dimension2",
        value: "versioned-value",
        isVersioned: true,
        isLiteral: false,
      });
    });

    it("should handle multiple filters with different types", async () => {
      const filters: SingleFilters = {
        dimension1: { type: "single", value: "value1" },
        dimension2: { type: "single", value: "value2" },
        dimension3: { type: "single", value: "value3" },
      };

      const result = await getQueryFilters(filters, {
        cubeIri: "test-cube",
        dimensionsMetadata: mockDimensionsMetadata,
        sparqlClient: mockSparqlClient,
        cache: mockCache,
      });

      expect(result).toHaveLength(3);
      expect(result[0].i).toBe(0);
      expect(result[1].i).toBe(1);
      expect(result[2].i).toBe(2);
    });
  });
});
