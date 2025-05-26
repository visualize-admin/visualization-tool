import { CubeDimension } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import ParsingClient from "sparql-http-client/ParsingClient";
import { describe, expect, it, vi } from "vitest";

import { FilterValue } from "@/config-types";
import * as ns from "@/rdf/namespace";
import {
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
