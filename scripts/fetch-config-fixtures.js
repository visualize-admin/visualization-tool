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

const CY_FIXTURES_DIR = path.join(
  __dirname,
  "..",
  "cypress",
  "fixtures",
  "dev"
);

const run = async () => {
  console.log("Fetching configs from", ENDPOINT);
  const res = await fetch(ENDPOINT);
  const configs = await res.json();

  await fs.ensureDir(FIXTURES_DIR);
  await fs.ensureDir(CY_FIXTURES_DIR);
  await fs.emptyDir(FIXTURES_DIR);

  const validConfigs = configs
    .filter((c) => c.data && c.data.meta)
    .slice(0, 10);

  await Promise.all(
    validConfigs.map(async (config) => {
      return fs.writeJSON(
        path.join(FIXTURES_DIR, `${config.key}.json`),
        config
      );
    })
  );

  await fs.writeJSON(
    path.join(CY_FIXTURES_DIR, `config-keys.json`),
    validConfigs.map((c) => c.key)
  );

  console.log("Wrote configs to", FIXTURES_DIR);
};

run().catch((e) => console.error(e));
