#!/usr/bin/env node
require("isomorphic-unfetch");
const fs = require("fs-extra");
const path = require("path");

// TODO: Change to prod endpoint once this API route is deployed there
const ENDPOINT = "https://dev.visualize.admin.ch/api/config/all";
const FIXTURES_DIR = path.join(
  __dirname,
  "..",
  "app",
  "test",
  "__fixtures",
  "dev"
);

const run = async () => {
  console.log("Fetching configs from", ENDPOINT);
  const res = await fetch(ENDPOINT);
  const configs = await res.json();

  await fs.ensureDir(FIXTURES_DIR);
  await fs.emptyDir(FIXTURES_DIR);

  await Promise.all(
    configs
      .filter(c => c.data && c.data.meta)
      .slice(0, 10)
      .map(async config => {
        return fs.writeJSON(
          path.join(FIXTURES_DIR, `${config.key}.json`),
          config
        );
      })
  );

  console.log("Wrote configs to", FIXTURES_DIR);
};

run().catch(e => console.error(e));
