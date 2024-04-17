import { SearchCube } from "@/domain/data";

import {
  computeScores,
  exactMatchPoints,
  fields,
} from "./query-search-score-utils";

jest.mock("@tpluscode/sparql-builder", () => ({}));

describe("compute scores", () => {
  const cubes = [
    { iri: "a", title: "national" },
    { iri: "b", title: "national", description: "economy" },
    { iri: "c", creator: { label: "national" } },
    { iri: "d", creator: { label: "" } },
    { iri: "e", title: "National Economy of Switzerland" },
  ] as unknown as SearchCube[];

  it("should compute weighted score per cube from score rows", () => {
    const scores = computeScores(cubes, { query: "national economy" });
    expect(scores.a.score).toEqual(1 + fields.title.weight);
    expect(scores.b.score).toEqual(
      1 + fields.title.weight + fields.description.weight
    );
    expect(scores.c.score).toEqual(1 + fields.creatorLabel.weight);
    expect(scores.d.score).toEqual(1);
    expect(scores.e.score).toEqual(
      1 + fields.title.weight * 2 + exactMatchPoints
    );
  });
});
