import { NamedNode } from "rdf-js";

import { SingleFilters } from "@/config-types";
import { VISUALIZE_MOST_RECENT_VALUE } from "@/domain/most-recent-value";
import * as ns from "@/rdf/namespace";
import { getCubeDimensions } from "@/rdf/queries";
import {
  DimensionMetadata,
  getQuery,
  getQueryFilters,
} from "@/rdf/query-possible-filters";
import mockChartConfig from "@/test/__fixtures/config/prod/column-traffic-pollution.json";

jest.mock("@/rdf/query-dimension-values", () => ({
  loadMaxDimensionValue: jest.fn().mockResolvedValue("123"),
}));

const getCubeDimensionMock = (iri: string, order: string) => {
  return {
    path: {
      value: iri,
    },
    out: (p: NamedNode) => {
      switch (p.value) {
        case ns.sh.order.value: {
          return {
            term: {
              value: order,
            },
          };
        }
        case ns.cube`meta/dimensionRelation`.value: {
          return [];
        }
        default: {
          return {
            out: () => {
              return {
                value: undefined,
                values: [],
                term: undefined,
                terms: [],
                list() {
                  return [];
                },
              };
            },
            value: undefined,
            values: [],
            term: undefined,
            terms: [],
            list() {
              return [];
            },
            map: () => [],
          };
        }
      }
    },
  };
};

describe("DataCubeComponents", () => {
  const fakeCube = {
    dimensions: [
      getCubeDimensionMock("dim1", "10"),
      getCubeDimensionMock("dim2", "0"),
    ],
  } as any;
  it("should return sorted components", async () => {
    const dimensions = await getCubeDimensions({
      cube: fakeCube,
      locale: "en",
      sparqlClient: {} as any,
      unversionedCubeIri: "cube",
      cache: undefined,
    });
    expect(dimensions.map((d) => d.data.order)).toEqual([0, 10]);
  });
});

describe("PossibleFilters", () => {
  const runTest = async (
    cubeIri: string,
    filters: SingleFilters,
    dimensionsMetadata: DimensionMetadata[],
    expectedQuery: string
  ) => {
    const queryFilters = await getQueryFilters(filters, {
      cubeIri,
      dimensionsMetadata,
      sparqlClient: {} as any,
    });
    const query = getQuery(cubeIri, queryFilters);
    expect(query).toEqual(expectedQuery);
  };

  it("should generate a correct SPARQL query without ordering", async () =>
    await runTest(
      "cube",
      {
        "dim1/2": {
          type: "single",
          value: "val1",
        },
        dim2: {
          type: "single",
          value: "val2",
        },
      },
      [
        {
          iri: "dim1/2",
          isVersioned: true,
          isLiteral: false,
        },
        {
          iri: "dim2",
          isVersioned: false,
          isLiteral: true,
        },
      ],
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v ?dimension1 WHERE {
  <cube> cube:observationSet/cube:observation ?observation .
  ?observation <dim1/2> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  ?observation <dim2> ?dimension1 .
  BIND(STR(?dimension1) AS ?dimension1_str)
  VALUES ?dimension0_v { <val1> }
  BIND(?dimension1_str = "val2" AS ?d1)
}
ORDER BY DESC(?d1)
LIMIT 1`
    ));

  it("should generate a correct SPARQL query with ordering", async () =>
    await runTest(
      "cube",
      {
        "dim1/2": {
          type: "single",
          value: "val1",
        },
        dim2: {
          type: "single",
          value: "val2",
        },
        dim3: {
          type: "single",
          value: "val3",
        },
      },
      [
        {
          iri: "dim1/2",
          isVersioned: true,
          isLiteral: false,
        },
        {
          iri: "dim2",
          isVersioned: false,
          isLiteral: true,
        },
        {
          iri: "dim3",
          isVersioned: false,
          isLiteral: true,
        },
      ],
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v ?dimension1 ?dimension2 WHERE {
  <cube> cube:observationSet/cube:observation ?observation .
  ?observation <dim1/2> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  ?observation <dim2> ?dimension1 .
  BIND(STR(?dimension1) AS ?dimension1_str)
  ?observation <dim3> ?dimension2 .
  BIND(STR(?dimension2) AS ?dimension2_str)
  VALUES ?dimension0_v { <val1> }
  BIND(?dimension1_str = "val2" AS ?d1)
  BIND(?dimension2_str = "val3" AS ?d2)
}
ORDER BY DESC(?d1) DESC(?d2)
LIMIT 1`
    ));

  it("should pre-fetch max value if using dynamic max value", async () => {
    await runTest(
      "cube",
      {
        "dim1/2": {
          type: "single",
          value: VISUALIZE_MOST_RECENT_VALUE,
        },
      },
      [
        {
          iri: "dim1/2",
          isVersioned: true,
          isLiteral: true,
        },
      ],
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v WHERE {
  <cube> cube:observationSet/cube:observation ?observation .
  ?observation <dim1/2> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  BIND(STR(?dimension0_v) AS ?dimension0_v_str)
  VALUES ?dimension0_v_str { "123" }
}

LIMIT 1`
    );
  });

  it("should generate a correct SPARQL query based on real cube", async () =>
    await runTest(
      mockChartConfig.data.dataSet,
      mockChartConfig.data.chartConfig.filters as SingleFilters,
      // assumption: the versioned dimension iris are the same as the keys of the filters
      Object.keys(mockChartConfig.data.chartConfig.filters).map((iri) => ({
        iri,
        isVersioned: true,
        isLiteral: false,
      })),
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v ?dimension1_v ?dimension2_v WHERE {
  <https://environment.ld.admin.ch/foen/ubd003701/1> cube:observationSet/cube:observation ?observation .
  ?observation <https://environment.ld.admin.ch/foen/ubd003701/beurteilung> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  ?observation <https://environment.ld.admin.ch/foen/ubd003701/gemeindetype> ?dimension1 .
  ?dimension1 schema:sameAs ?dimension1_v .
  ?observation <https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit> ?dimension2 .
  ?dimension2 schema:sameAs ?dimension2_v .
  VALUES ?dimension0_v { <https://environment.ld.admin.ch/foen/ubd003701/beurteilung/%3EIGWLSV> }
  BIND(?dimension1_v = <https://environment.ld.admin.ch/foen/ubd003701/gemeindeTyp/CH> AS ?d1)
  BIND(?dimension2_v = <https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteEinheit/Pers> AS ?d2)
}
ORDER BY DESC(?d1) DESC(?d2)
LIMIT 1`
    ));
});
