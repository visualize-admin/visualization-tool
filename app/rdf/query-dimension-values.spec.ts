import rdf from "rdf-ext";

import { FilterValue } from "@/config-types";

import { ExtendedCube } from "./extended-cube";
import { getQueryFilters } from "./query-dimension-values";

jest.mock("rdf-cube-view-query", () => ({}));
jest.mock("./extended-cube", () => ({}));
jest.mock("@zazuko/cube-hierarchy-query/index", () => ({}));

describe("getQueryFilters", () => {
  const cube = {
    dimensions: [
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
    ],
  } as any as ExtendedCube;
  const filters: [string, FilterValue][] = [
    ["http://example.com/dimension1", { type: "single", value: "value1" }],
  ];

  it("should include other dimensions in the returning part of the query", async () => {
    const queryPart = getQueryFilters(
      filters,
      cube,
      "http://example.com/dimension2"
    );
    expect(queryPart).toContain("<http://example.com/dimension1>");
  });
});
