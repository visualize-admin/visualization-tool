import {
  computeScores,
  exactMatchPoints,
  langMultiplier,
  weights,
} from "./query-search-score-utils";

// jest.mock("rdf-ext", () => ({}));
// jest.mock("@rdf-esm/data-model", () => ({}));
// jest.mock("@rdf-esm/namespace", () => ({
//   default: (x) => `${x}`,
// }));
// jest.mock("@tpluscode/rdf-string", () => ({}));
jest.mock("@tpluscode/sparql-builder", () => ({}));
// jest.mock("@tpluscode/rdf-ns-builders", () => ({}));

describe("compute scores", () => {
  const scores = [
    { lang: "en", cube: "a", name: "national" },
    { lang: "en", cube: "b", name: "national", description: "economy" },
    { lang: "de", cube: "c", creatorLabel: "national" },
    { lang: "de", cube: "d", creatorLabel: "" },
    { lang: "en", cube: "e", name: "National Economy of Switzerland" },
  ];

  it("should compute weighted score per cube from score rows", () => {
    const reduced = computeScores(scores, {
      query: "national economy",
      identifierName: "cube",
      lang: "en",
    });
    expect(reduced["a"].score).toEqual(weights.name * langMultiplier);
    expect(reduced["b"].score).toEqual(
      (weights.name + weights.description) * langMultiplier
    );
    expect(reduced["c"].score).toEqual(weights.creatorLabel);
    expect(reduced["d"]).toBeUndefined();
    expect(reduced["e"].score).toEqual(
      (weights.name * 2 + exactMatchPoints) * langMultiplier
    );
  });
});
