const fs = require("fs");

const envs = ["test", "int", "prod"];
const queries = ["metadata"];
const cubes = ["StateAccounts_Office/4/"];

const generate = () => {
  const file = `name: Performance tests

on: workflow_dispatch

jobs:
  compile:
    name: Compile site assets
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repo
        uses: actions/checkout@v2
      - name: Run the build process with Docker
        uses: addnab/docker-run-action@v3
        with:
          image: grafana/k6:latest
          options: -e K6_PROMETHEUS_RW_USERNAME=\${{ secrets.K6_PROMETHEUS_RW_USERNAME }} -e K6_PROMETHEUS_RW_PASSWORD=\${{ secrets.K6_PROMETHEUS_RW_PASSWORD }} -e K6_PROMETHEUS_RW_SERVER_URL=\${{ secrets.K6_PROMETHEUS_RW_SERVER_URL }}
          run: ${envs
            .map((env) => {
              return queries.map((query) => {
                return cubes.map((cube) => {
                  return `k6 run -o experimental-prometheus-rw --tag testid=${cube} --env ENV=${env} --env CUBE=${cube} - <k6/performance-tests/graphql/${query}.js`;
                });
              });
            })
            .join(" && ")}`;

  fs.writeFileSync("./.github/workflows/performance-tests.yml", file);
};

generate();
