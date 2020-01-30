import { ApolloServer } from "apollo-server-micro";
import { DataCubeEntryPoint, DataCube } from "@zazuko/query-rdf-data-cube";
import { locales } from "../../locales/locales";
import { SPARQL_ENDPOINT } from "../../domain/env";
import typeDefs from "../../graphql/schema.graphql";

const entry = new DataCubeEntryPoint(SPARQL_ENDPOINT, {
  languages: [...locales],
  extraMetadata: [
    {
      variable: "contact",
      iri: "https://pcaxis.described.at/contact",
      multilang: true
    },
    {
      variable: "source",
      iri: "https://pcaxis.described.at/source",
      multilang: true
    },
    {
      variable: "survey",
      iri: "https://pcaxis.described.at/survey",
      multilang: true
    },
    {
      variable: "database",
      iri: "https://pcaxis.described.at/database",
      multilang: true
    },
    {
      variable: "unit",
      iri: "https://pcaxis.described.at/unit",
      multilang: true
    },
    {
      variable: "note",
      iri: "https://pcaxis.described.at/note",
      multilang: true
    },
    {
      variable: "dateCreated",
      iri: "http://schema.org/dateCreated",
      multilang: false
    },
    { variable: "dateModified", iri: "http://schema.org/dateModified" },
    {
      variable: "description",
      iri: "http://www.w3.org/2000/01/rdf-schema#comment",
      multilang: true
    }
  ]
});

type Cube = {
  iri: string;
  title: string;
  contact?: string;
  source?: string;
  description?: string;
  cube: DataCube;
};

const cube2Cube = (cube: DataCube): Cube => {
  return {
    iri: cube.iri,
    title: cube.label.value,
    contact: cube.extraMetadata.get("contact")?.value,
    source: cube.extraMetadata.get("source")?.value,
    description: cube.extraMetadata.get("description")?.value,
    cube
  };
};

const resolvers = {
  Query: {
    dataCubes: async () => {
      const cubes = await entry.dataCubes();
      return cubes.map(cube2Cube);
    },
    dataCubeByIri: async (_: $IntentionalAny, { iri }: { iri: string }) => {
      const cube = await entry.dataCubeByIri(iri);
      return cube2Cube(cube);
    }
  },
  DataCube: {
    dimensions: async (parent: Cube) => {
      const dims = await parent.cube.dimensions();
      return dims.map(dim => {
        return {
          iri: dim.iri.value,
          label: dim.label.value
        };
      });
    },
    measures: async (parent: Cube) => {
      const measures = await parent.cube.measures();
      return measures.map(m => {
        return {
          iri: m.iri.value,
          label: m.label.value
        };
      });
    }
  },
  Dimension: {
    __resolveType(obj: $FixMe) {
      return "NominalDimension";
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false
  }
};

export default server.createHandler({ path: "/api/graphql" });
