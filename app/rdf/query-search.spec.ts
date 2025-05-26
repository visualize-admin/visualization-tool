import { describe, expect, it, vi } from "vitest";

import { SearchCube } from "@/domain/data";

import {
  computeScores,
  exactMatchPoints,
  fields,
} from "./query-search-score-utils";

vi.mock("@tpluscode/sparql-builder", () => ({}));

describe("compute scores", () => {
  const cubes = [
    { iri: "a", title: "national", themes: [], subthemes: [] },
    {
      iri: "b",
      title: "national",
      description: "economy",
      themes: [],
      subthemes: [],
    },
    { iri: "c", creator: { label: "national" }, themes: [], subthemes: [] },
    { iri: "d", creator: { label: "" }, themes: [], subthemes: [] },
    {
      iri: "e",
      title: "National Economy of Switzerland",
      themes: [],
      subthemes: [],
    },
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
