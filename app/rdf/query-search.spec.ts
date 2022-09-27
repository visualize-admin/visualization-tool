import { computeScores, weights } from "./query-search-score-utils";

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
    { cube: "a", name: "national" },
    { cube: "b", name: "national", description: "economy" },
    { cube: "c", creatorLabel: "national" },
    { cube: "d", creatorLabel: "" },
  ];

  it("should compute weighted score per cube from score rows", () => {
    const reduced = computeScores(scores, {
      query: "national economy",
      identifierName: "cube",
    });
    expect(reduced["a"].score).toEqual(weights.name);
    expect(reduced["b"].score).toEqual(weights.name + weights.description);
    expect(reduced["c"].score).toEqual(weights.creatorLabel);
    expect(reduced["d"]).toBeUndefined();
  });
});
