import { makeCubeIndex, searchCubes, wrap } from "./search";
import cubesListRaw from "../test/__fixtures/api/cubes-list.json";
import { ResolvedDataCube } from "../graphql/shared-types";
import keyBy from "lodash/keyBy";

const cubesList = cubesListRaw as ResolvedDataCube["data"][];

describe("wrap ", () => {
  it("should be able to highlight given part of a string, given indices and open/close tags", () => {
    const example =
      "The science of operations, as derived from mathematics more especially, is a science of itself, and has its own abstract truth and value.";
    const indices = [
      [4, 10],
      [30, 36],
    ] as readonly [number, number][];
    const wrapped = wrap(example, indices, {
      tagOpen: "<b>",
      tagClose: "</b>",
    });
    expect(wrapped).toEqual(
      "The <b>science</b> of operations, as <b>derived</b> from mathematics more especially, is a science of itself, and has its own abstract truth and value."
    );
  });
});

describe("search index", () => {
  const index = makeCubeIndex(cubesList);
  const cubesByIri = keyBy(
    cubesList.map((x) => ({ iri: x.iri, data: x })),
    (x) => x.iri
  ) as unknown as Record<string, ResolvedDataCube>;

  it("should work independent of casing", () => {
    expect(searchCubes(index, "Bathing", cubesByIri).length).toBe(1);
    expect(searchCubes(index, "bathing", cubesByIri).length).toBe(1);
  });

  it("should work even with trailing space", () => {
    expect(searchCubes(index, "bathing ", cubesByIri).length).toBe(1);
    expect(searchCubes(index, "Bathing ", cubesByIri).length).toBe(1);
  });

  it("should work for themes", () => {
    expect(
      searchCubes(index, "Territory and environment ", cubesByIri).length
    ).toBe(6);
  });

  it("should work with keywords", () => {
    expect(searchCubes(index, "bruit", cubesByIri).length).toBe(1);
  });

  it("should work with creator", () => {
    expect(searchCubes(index, "SFOE", cubesByIri).length).toBe(4);
  });

  it("should work with commas", () => {
    expect(searchCubes(index, "Agriculture, forestry", cubesByIri).length).toBe(
      1
    );
  });

  it("should work with description", () => {
    const cubes = searchCubes(
      index,
      "The measurement data are the surveyed mean",
      cubesByIri
    );
    expect(cubes.length).toBe(11);
    expect(cubes[0].dataCube.data.title).toEqual(
      "Heavy Metal Soil Contamination"
    );
  });
});
