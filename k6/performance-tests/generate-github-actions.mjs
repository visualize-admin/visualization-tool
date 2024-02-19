import fs from "fs";

import cubes from "./data.js";

const envs = ["test", "int", "prod"];
const queries = [
  "DataCubeComponents",
  "DataCubeMetadata",
  "DataCubeObservations",
  "DataCubePreview",
  "PossibleFilters",
];

const generateAutoTests = () => {
  const commands = envs
    .flatMap((env) =>
      queries.flatMap((query) =>
        cubes.map((cube) =>
          getRunCommand(
            env,
            query,
            cube,
            `https://${
              env === "prod" ? "" : `${env}.`
            }visualize.admin.ch/api/graphql`,
            true,
            false
          )
        )
      )
    )
    .join(" &&\n            ");
  const file = `name: GraphQL performance tests (auto)

on:
  workflow_dispatch:
  schedule:
    - cron: "37 * * * *"

jobs:
  run_tests:
    name: Run tests
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v2
      - name: Run k6 and upload results to Prometheus
        uses: addnab/docker-run-action@v3
        with:
          image: grafana/k6:latest
          options: |
            -v \${{ github.workspace }}:/root
            -e K6_PROMETHEUS_RW_USERNAME=\${{ secrets.K6_PROMETHEUS_RW_USERNAME }}
            -e K6_PROMETHEUS_RW_PASSWORD=\${{ secrets.K6_PROMETHEUS_RW_PASSWORD }}
            -e K6_PROMETHEUS_RW_SERVER_URL=\${{ secrets.K6_PROMETHEUS_RW_SERVER_URL }}
            -e K6_PROMETHEUS_RW_TREND_STATS=avg
          run: |
            ${commands}
`;

  fs.writeFileSync("./.github/workflows/performance-tests.yml", file);
};

generateAutoTests();

const generatePRTests = () => {
  const commands = queries
    .flatMap((query) =>
      cubes.map((cube) =>
        getRunCommand(
          "PR",
          query,
          cube,
          "${{ github.event.deployment_status.target_url }}/api/graphql",
          false,
          true
        )
      )
    )
    .join(" && ");
  const file = `name: GraphQL performance tests (PR)

on: [deployment_status]

env:
  SUMMARY: ''

jobs:
  run_tests:
    if: github.event.deployment_status.state == 'success'
    name: Run tests
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v2
      - name: Send an HTTP request to start up the server
        run: |
          curl -s '\${{ github.event.deployment_status.target_url }}/api/graphql' -X 'POST' -H 'Content-Type: application/json' -d '{"operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas.admin.ch/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9","filters":{"https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":{"type":"single","value":"https://ld.admin.ch/canton/1"}}}},"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) { dataCubeObservations(sourceType: $sourceType, sourceUrl: $sourceUrl, locale: $locale, cubeFilter: $cubeFilter) }"}' > /dev/null
      - name: Run k6
        uses: addnab/docker-run-action@v3
        with:
          image: grafana/k6:latest
          options: -v \${{ github.workspace }}:/root
          run: |
            echo "SUMMARY=$(${commands})" >> $GITHUB_ENV
      - name: GQL performance tests ✅
        if: \${{ env.SUMMARY == '' }}
        run: |
          curl --request POST \
          --url https://api.github.com/repos/\${{ github.repository }}/statuses/\${{ github.sha }} \
          --header 'authorization: Bearer \${{ secrets.GITHUB_TOKEN }}' \
          --header 'content-type: application/json' \
          --data '{
            "context": "GQL performance tests",
            "state": "success",
            "description": "GQL performance tests passed"
          }'
      - name: GQL performance tests 🚨
        if: \${{ env.SUMMARY != '' }}
        run: |
          curl --request POST  \
          --url https://api.github.com/repos/\${{ github.repository }}/statuses/\${{ github.sha }} \
          --header 'authorization: Bearer \${{ secrets.GITHUB_TOKEN }}' \
          --header 'content-type: application/json' \
          --data '{
            "context": "GQL performance tests",
            "state": "failure",
            "description": "GQL performance tests failed for the following queries: \${{ env.SUMMARY }}"
          }'
`;

  fs.writeFileSync("./.github/workflows/performance-tests-pr.yml", file);
};

generatePRTests();

function getRunCommand(
  env,
  query,
  cube,
  endpoint,
  sendToPrometheus = true,
  checkTiming = true
) {
  return `k6 run${
    sendToPrometheus ? " -o experimental-prometheus-rw" : ""
  } --tag testid=${query} --env ENV=${env} --env ENDPOINT=${endpoint} --env CUBE_IRI=${
    cube.iri
  } --env CUBE_LABEL=${cube.label} --env ROOT_PATH=/root/ --env CHECK_TIMING=${
    checkTiming ? "true" : "false"
  } - </root/k6/performance-tests/graphql/${query}.js --quiet`;
}
