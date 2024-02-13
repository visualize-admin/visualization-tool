const fs = require("fs");

const envs = ["test", "int", "prod"];
const queries = [
  "DataCubeComponents",
  "DataCubeMetadata",
  "DataCubeObservations",
  "DataCubePreview",
];
const cubes = [
  {
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    label: "Photovoltaikanlagen/9",
  },
  {
    iri: "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3",
    label: "NFI/2023-3",
  },
  {
    iri: "https://energy.ld.admin.ch/elcom/electricityprice",
    label: "Elcom",
  },
];
const commands = envs
  .flatMap((env) =>
    queries.flatMap((query) =>
      cubes.map((cube) => getRunCommand(env, query, cube))
    )
  )
  .join(" &&\n            ");

const generate = () => {
  const file = `name: GraphQL performance tests

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
          run: |
            ${commands}`;

  fs.writeFileSync("./.github/workflows/performance-tests.yml", file);
};

generate();

function getRunCommand(env, query, cube) {
  return `k6 run -o experimental-prometheus-rw --tag testid=${query} --env ENV=${env} --env CUBE_IRI=${cube.iri} --env CUBE_LABEL=${cube.label} - </root/k6/performance-tests/graphql/${query}.js`;
}
