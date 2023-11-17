import { IncomingMessage } from "http";

import { GraphQLResolveInfo } from "graphql";

import { createSource as createSource_ } from "@/rdf/create-source";
import { ExtendedCube as ExtendedCube_ } from "@/rdf/extended-cube";
import { getCubeObservations as getCubeObservations_ } from "@/rdf/queries";
import { unversionObservation as unversionObservation_ } from "@/rdf/query-dimension-values";

import { createContext } from "./context";
import { Query } from "./resolvers";

const getCubeObservations = getCubeObservations_ as unknown as jest.Mock<
  typeof getCubeObservations_
>;
const createSource = createSource_ as unknown as jest.Mock<
  typeof createSource_
>;

const ExtendedCube = ExtendedCube_ as unknown as jest.Mock<
  typeof ExtendedCube_
>;

const unversionObservation = unversionObservation_ as unknown as jest.Mock<
  typeof unversionObservation_
>;

jest.mock("../rdf/query-dimension-values", () => ({
  unversionObservation: jest.fn(),
}));
jest.mock("../rdf/query-search", () => ({}));
jest.mock("../rdf/queries", () => ({
  getCubeObservations: jest.fn(),
  createCubeDimensionValuesLoader: () => async () => [],
  getLatestCube: () => ({
    fetchShape: () => ({}),
  }),
}));
jest.mock("../rdf/create-source", () => ({
  createSource: jest.fn(),
}));
jest.mock("../rdf/query-hierarchies", () => ({}));
jest.mock("../rdf/parse", () => ({}));
jest.mock("../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

jest.mock("@rdf-esm/data-model", () => ({}));
jest.mock("@rdf-esm/term-map", () => ({}));
jest.mock("@rdf-esm/namespace", () => ({}));
jest.mock("@tpluscode/sparql-builder", () => ({}));
jest.mock("@tpluscode/rdf-ns-builders", () => ({}));
jest.mock("@tpluscode/rdf-string", () => ({}));

describe("possible filters", () => {
  beforeEach(() => {
    getCubeObservations.mockReset();
  });

  it("should try to find an observation given possible filters, relaxing fitlers from the bottom", async () => {
    // @ts-ignore
    getCubeObservations.mockImplementation(async ({ filters }) => {
      if (Object.keys(filters).length == 2) {
        return {
          query: "",
          observations: [],
        };
      } else {
        return {
          query: "",
          observations: [
            {
              "https://fake-dimension-iri-1": 1,
              "https://fake-dimension-iri-2": 3,
            },
          ],
        };
      }
    });

    unversionObservation.mockImplementation(({ observation }) => observation);

    // @ts-ignore
    createSource.mockImplementation(() => ({
      cube: () => ({}),
    }));
    // @ts-ignore
    ExtendedCube.mockImplementation(() => ({
      fetchCube: () => ({}),
      fetchShape: () => ({}),
    }));

    const res = await Query?.possibleFilters?.(
      {},
      {
        iri: "https://fake-iri",
        sourceType: "sparql",
        sourceUrl: "https://fake-source.com/query",
        filters: {
          "https://fake-dimension-iri-1": { type: "single", value: 1 },
          "https://fake-dimension-iri-2": { type: "single", value: 2 },
        },
      },
      createContext({ req: { headers: {} } as unknown as IncomingMessage }),
      {
        variableValues: {
          locale: "en",
          sourceUrl: "https://fake-source.com/query",
        },
      } as unknown as GraphQLResolveInfo
    );

    expect(res).toEqual([
      {
        iri: "https://fake-dimension-iri-1",
        type: "single",
        value: 1,
      },
      {
        iri: "https://fake-dimension-iri-2",
        type: "single",
        value: 3,
      },
    ]);
    expect(getCubeObservations).toHaveBeenCalledTimes(2);
  });
});
