import { SingleFilters } from "@/config-types";
import { getQuery, getQueryFilters } from "@/rdf/query-possible-filters";
import mockChartConfig from "@/test/__fixtures/config/prod/column-traffic-pollution.json";

describe("PossibleFilters", () => {
  const runTest = (
    cubeIri: string,
    filters: SingleFilters,
    versionedDimensionIris: string[],
    expectedQuery: string
  ) => {
    const queryFilters = getQueryFilters(filters, versionedDimensionIris);
    const query = getQuery(cubeIri, queryFilters);
    expect(query).toEqual(expectedQuery);
  };

  it("should generate a correct SPARQL query without ordering", () =>
    runTest(
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
      ["dim1/2"],
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v ?dimension1 WHERE {
  <cube> cube:observationSet/cube:observation ?observation .
  ?observation <dim1/2> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  ?observation <dim2> ?dimension1 .
  VALUES ?dimension0_v { <val1> }
  BIND(?dimension1 = <val2> AS ?d1)
}

LIMIT 1`
    ));

  it("should generate a correct SPARQL query with ordering", () =>
    runTest(
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
      ["dim1/2"],
      `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?dimension0_v ?dimension1 ?dimension2 WHERE {
  <cube> cube:observationSet/cube:observation ?observation .
  ?observation <dim1/2> ?dimension0 .
  ?dimension0 schema:sameAs ?dimension0_v .
  ?observation <dim2> ?dimension1 .
  ?observation <dim3> ?dimension2 .
  VALUES ?dimension0_v { <val1> }
  BIND(?dimension1 = <val2> AS ?d1)
  BIND(?dimension2 = <val3> AS ?d2)
}
ORDER BY DESC(?d1) DESC(?d2)
LIMIT 1`
    ));

  it("should generate a correct SPARQL query based on real cube", () =>
    runTest(
      mockChartConfig.data.dataSet,
      mockChartConfig.data.chartConfig.filters as SingleFilters,
      // assumption: the versioned dimension iris are the same as the keys of the filters
      Object.keys(mockChartConfig.data.chartConfig.filters),
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
