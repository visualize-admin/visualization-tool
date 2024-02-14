import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const query = `query DataCubeComponents(
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $cubeFilter: DataCubeComponentFilter!
) {
  dataCubeComponents(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}`;

const metadataByCubeIri = {
  "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9":
    {
      expectedQueryDuration: 750,
    },
  "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3": {
    expectedQueryDuration: 2000,
  },
  "https://energy.ld.admin.ch/elcom/electricityprice": {
    expectedQueryDuration: 10000,
  },
};

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;
const metadata = metadataByCubeIri[cubeIri];

const variables = {
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  cubeFilter: {
    iri: cubeIri,
  },
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 2,
};

const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export default function Components() {
  exec.vu.metrics.tags.env = env;
  exec.vu.metrics.tags.cube = cubeLabel;

  const res = http.post(
    `https://${env === "prod" ? "" : `${env}.`}visualize.admin.ch/api/graphql`,
    JSON.stringify({ query, variables }),
    { headers }
  );

  check(res, {
    "Response must have data": (res) => {
      const body = res.json();
      return (
        body.data &&
        body.data.dataCubeComponents &&
        body.data.dataCubeComponents.dimensions &&
        body.data.dataCubeComponents.dimensions.length > 0 &&
        body.data.dataCubeComponents.measures &&
        body.data.dataCubeComponents.measures.length > 0
      );
    },
  });
}
