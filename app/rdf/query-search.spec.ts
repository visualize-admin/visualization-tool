import mapValues from "lodash/mapValues";

import { computeScores } from "./query-search-score-utils";

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
    { cube: "a", scoreName: 1 },
    { cube: "a", scoreDescription: 1 },
    { cube: "b", scoreName: 5 },
    { cube: "c", scoreCreator: 1 },
    { cube: "d", scoreCreator: 0 },
  ].map((x) => mapValues(x, (v) => ({ value: v })));

  it("should compute weighted score per cube from score rows, and discard cubes with score: 0", () => {
    const reduced = computeScores(scores, {
      keepZeros: true,
    });
    expect(reduced["a"].score).toEqual(7);
    expect(reduced["b"].score).toEqual(25);
    expect(reduced["c"].score).toEqual(1);
    expect(reduced["d"].score).toEqual(0);
  });

  it("should compute weighted score per cube from score rows, , and keep cube with score: 0", () => {
    const reduced = computeScores(scores, {
      keepZeros: false,
    });
    expect(reduced["a"].score).toEqual(7);
    expect(reduced["b"].score).toEqual(25);
    expect(reduced["c"].score).toEqual(1);
    expect(reduced["d"]).toBeUndefined();
  });
});
