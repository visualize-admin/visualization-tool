import { GraphQLResolveInfo } from "graphql";

import {
  getCubeObservations as getCubeObservations_,
  createSource as createSource_,
} from "../rdf/queries";
import { unversionObservation as unversionObservation_ } from "../rdf/query-dimension-values";

import { GraphQLContext } from "./context";
import { Query } from "./resolvers";

const getCubeObservations = getCubeObservations_ as unknown as jest.Mock<
  typeof getCubeObservations_
>;
const createSource = createSource_ as unknown as jest.Mock<
  typeof createSource_
>;

const unversionObservation = unversionObservation_ as unknown as jest.Mock<
  typeof unversionObservation_
>;

jest.mock("../rdf/query-dimension-values", () => ({
  unversionObservation: jest.fn(),
}));
jest.mock("../rdf/query-search", () => ({
  unversionObservation: jest.fn(),
}));
jest.mock("../rdf/queries", () => ({
  getCubeObservations: jest.fn(),
}));
jest.mock("../rdf/create-source", () => ({
  createSource: jest.fn(),
}));
jest.mock("../rdf/query-cube-metadata", () => ({}));
jest.mock("../rdf/query-hierarchies", () => ({}));

describe("possible filters", () => {
  beforeEach(() => {
    getCubeObservations.mockReset();
  });
  it("should try to find an observation given possible filters, relaxing fitlers from the bottom", async () => {
    // @ts-ignore
    getCubeObservations.mockImplementation(async ({ filters }) => {
      if (Object.keys(filters).length == 2) {
        return {
          observations: [],
          observationsRaw: {},
          query: "",
        };
      } else {
        return {
          observationsRaw: {},
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
      {
        setup: () => Promise.resolve({ sparqlClient: {} }),
      } as unknown as GraphQLContext,
      {} as GraphQLResolveInfo
    );
    expect(res).toEqual([
      { iri: "https://fake-dimension-iri-1", type: "single", value: 1 },
      { iri: "https://fake-dimension-iri-2", type: "single", value: 3 },
    ]);
    expect(getCubeObservations).toHaveBeenCalledTimes(2);
  });
});
