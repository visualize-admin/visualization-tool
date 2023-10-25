import { ParsedRawSearchCube } from "./query-search";
import {
  computeScores,
  exactMatchPoints,
  langMultiplier,
  weights,
} from "./query-search-score-utils";

jest.mock("@tpluscode/sparql-builder", () => ({}));

describe("compute scores", () => {
  const scores = [
    { lang: "en", iri: "a", title: "national" },
    { lang: "en", iri: "b", title: "national", description: "economy" },
    { lang: "de", iri: "c", creatorLabel: "national" },
    { lang: "de", iri: "d", creatorLabel: "" },
    { lang: "en", iri: "e", title: "National Economy of Switzerland" },
  ] as unknown as ParsedRawSearchCube[];

  it("should compute weighted score per cube from score rows", () => {
    const reduced = computeScores(scores, {
      query: "national economy",
      locale: "en",
    });
    expect(reduced.a.score).toEqual(weights.title * langMultiplier);
    expect(reduced.b.score).toEqual(
      (weights.title + weights.description) * langMultiplier
    );
    expect(reduced.c.score).toEqual(weights.creatorLabel);
    expect(reduced.d).toBeUndefined();
    expect(reduced.e.score).toEqual(
      (weights.title * 2 + exactMatchPoints) * langMultiplier
    );
  });
});
