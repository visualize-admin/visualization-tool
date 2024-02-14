import { check, fail } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const query = `query DataCubePreview(
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $cubeFilter: DataCubePreviewFilter!
) {
  dataCubePreview(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}`;

const metadataByCubeIri = {
  "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9":
    {},
  "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3": {},
  "https://energy.ld.admin.ch/elcom/electricityprice": {},
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
    latest: false,
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
        body.data.dataCubePreview &&
        body.data.dataCubePreview.dimensions &&
        body.data.dataCubePreview.dimensions.length > 0 &&
        body.data.dataCubePreview.measures &&
        body.data.dataCubePreview.measures.length > 0 &&
        body.data.dataCubePreview.observations &&
        body.data.dataCubePreview.observations.length > 0
      );
    },
  });
}
