import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const query = `query PossibleFilters(
  $iri: String!
  $sourceType: String!
  $sourceUrl: String!
  $filters: Filters!
) {
  possibleFilters(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    filters: $filters
  ) {
    iri
    type
    value
  }
}`;

const metadataByCubeIri = {
  "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9":
    {
      iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
      filters: {
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
          {
            type: "single",
            value: "https://ld.admin.ch/canton/1",
          },
      },
      expectedQueryDuration: 600,
    },
  "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3": {
    iri: "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3",
    filters: {
      "https://environment.ld.admin.ch/foen/nfi/unitOfReference": {
        type: "single",
        value: "https://ld.admin.ch/country/CHE",
      },
      "https://environment.ld.admin.ch/foen/nfi/classificationUnit": {
        type: "single",
        value:
          "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total",
      },
      "https://environment.ld.admin.ch/foen/nfi/inventory": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/Inventory/150",
      },
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382",
      },
      "https://environment.ld.admin.ch/foen/nfi/evaluationType": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/EvaluationType/1",
      },
    },
    expectedQueryDuration: 1500,
  },
  "https://energy.ld.admin.ch/elcom/electricityprice": {
    iri: "https://energy.ld.admin.ch/elcom/electricityprice",
    filters: {
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":
        {
          type: "single",
          value: "https://ld.admin.ch/municipality/1",
        },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category": {
        type: "single",
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
      },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator": {
        type: "single",
        value: "https://energy.ld.admin.ch/elcom/electricityprice/operator/486",
      },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product": {
        type: "single",
        value:
          "https://energy.ld.admin.ch/elcom/electricityprice/product/standard",
      },
    },
    expectedQueryDuration: 3500,
  },
};

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;
const metadata = metadataByCubeIri[cubeIri];

const variables = {
  iri: cubeIri,
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  filters: metadata.filters,
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 2,
};

const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export default function Observations() {
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
        body.data.possibleFilters &&
        body.data.possibleFilters.length > 0
      );
    },
  });
}
