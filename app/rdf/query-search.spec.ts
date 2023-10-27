import { ParsedRawSearchCube } from "./query-search";
import {
  computeScores,
  exactMatchPoints,
  weights,
} from "./query-search-score-utils";

jest.mock("@tpluscode/sparql-builder", () => ({}));

describe("compute scores", () => {
  const cubes = [
    { iri: "a", title: "national" },
    { iri: "b", title: "national", description: "economy" },
    { iri: "c", creatorLabel: "national" },
    { iri: "d", creatorLabel: "" },
    { iri: "e", title: "National Economy of Switzerland" },
  ] as unknown as ParsedRawSearchCube[];

  it("should compute weighted score per cube from score rows", () => {
    const scores = computeScores(cubes, { query: "national economy" });
    expect(scores.a.score).toEqual(1 + weights.title);
    expect(scores.b.score).toEqual(1 + weights.title + weights.description);
    expect(scores.c.score).toEqual(1 + weights.creatorLabel);
    expect(scores.d.score).toEqual(1);
    expect(scores.e.score).toEqual(1 + weights.title * 2 + exactMatchPoints);
  });
});
