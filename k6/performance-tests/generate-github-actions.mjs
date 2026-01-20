import fs from "fs";

import cubes from "./data.json" with { type: "json" };

const envs = ["test", "int", "prod"];
const queries = [
  "DataCubeComponents",
  "DataCubeMetadata",
  "DataCubeObservations",
  "DataCubePreview",
  "PossibleFilters",
];

const generateAutoTests = () => {
  const commands = envs.flatMap((env) =>
    queries.flatMap((query) =>
      cubes.map(
        (cube) =>
          "K6_PROMETHEUS_RW_USERNAME=${{ secrets.K6_PROMETHEUS_RW_USERNAME }} K6_PROMETHEUS_RW_PASSWORD=${{ secrets.K6_PROMETHEUS_RW_PASSWORD }} K6_PROMETHEUS_RW_SERVER_URL=${{ secrets.K6_PROMETHEUS_RW_SERVER_URL }} K6_PROMETHEUS_RW_TREND_STATS=avg " +
          getRunCommand(
            env,
            query,
            cube,
            `https://${env === "prod" ? "" : `${env}.`
            }visualize.admin.ch/api/graphql`,
            true,
            false
          )
      )
    )
  );
  const file = `# GENERATED FILE, DO NOT EDIT MANUALLY - use yarn run github:codegen instead

name: GraphQL performance tests (auto)

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
        uses: actions/checkout@v6
      - name: Download, unzip and install k6 binary
        run: |
          wget https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz
          tar -xzf k6-v0.49.0-linux-amd64.tar.gz
          sudo cp k6-v0.49.0-linux-amd64/k6 /usr/local/bin/k6
          export PATH=$PATH:/usr/local/bin
${commands
      .map(
        (command, i) => `      - name: Run k6 test (iteration ${i + 1})
        run: ${command}`
      )
      .join("\n")}`;

  fs.writeFileSync("./.github/workflows/performance-tests.yaml", file);
};

generateAutoTests();

const generatePRTests = () => {
  const commands = queries.flatMap((query) =>
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
  );
  const file = `# GENERATED FILE, DO NOT EDIT MANUALLY - use yarn run github:codegen instead

name: GraphQL performance tests (PR)

on:
  - deployment_status

env:
  SUMMARY: ""

jobs:
  run_tests:
    if: github.event.deployment_status.state == 'success'
    name: Run tests
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v6
      - name: Send an HTTP request to start up the server
        run: |
          curl -s '\${{ github.event.deployment_status.target_url }}/api/graphql' -X 'POST' -H 'Content-Type: application/json' -d '{"operationName":"DataCubeObservations","variables":{"locale":"en","sourceType":"sparql","sourceUrl":"https://lindas.cz-aws.net/query","cubeFilter":{"iri":"https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9","filters":{"https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":{"type":"single","value":"https://ld.admin.ch/canton/1"}}}},"query":"query DataCubeObservations($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) { dataCubeObservations(sourceType: $sourceType, sourceUrl: $sourceUrl, locale: $locale, cubeFilter: $cubeFilter) }"}' > /dev/null
      - name: Download, unzip and install k6 binary
        run: |
          wget https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz
          tar -xzf k6-v0.49.0-linux-amd64.tar.gz
          sudo cp k6-v0.49.0-linux-amd64/k6 /usr/local/bin/k6
          export PATH=$PATH:/usr/local/bin
${commands
      .map(
        (command, i) => `      - name: Run k6 test (iteration ${i + 1})
        run: echo "SUMMARY=\${{ env.SUMMARY }}$(${command})" >> $GITHUB_ENV`
      )
      .join("\n")}
      - name: GQL performance tests ❌
        if: \${{ env.SUMMARY != '' }}
        run: |
          curl --request POST  \
          --url https://api.github.com/repos/\${{ github.repository }}/statuses/\${{ github.sha }} \
          --header 'authorization: Bearer \${{ secrets.GITHUB_TOKEN }}' \
          --header 'content-type: application/json' \
          --data '{
            "context": "GQL performance tests",
            "state": "failure",
            "description": "\${{ env.SUMMARY }}"
          }'
`;

  fs.writeFileSync("./.github/workflows/performance-tests-pr.yaml", file);
};

generatePRTests();

function getRunCommand (
  env,
  query,
  cube,
  endpoint,
  sendToPrometheus = true,
  checkTiming = true
) {
  return `k6 run${sendToPrometheus ? " -o experimental-prometheus-rw" : ""
    } --tag testid=${query} --env ENV=${env} --env ENDPOINT=${endpoint} --env CUBE_IRI=${cube.iri
    } --env CUBE_LABEL=${cube.label} --env CHECK_TIMING=${checkTiming ? "true" : "false"
    } --env WORKSPACE=\${{ github.workspace }} --quiet - <k6/performance-tests/graphql/${query}.js`;
}
