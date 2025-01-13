#!/usr/bin/env ts-node

/**
 * Use this script to download remote configs locally
 */

// @ts-ignore
import path from "path";

import { build, completionHandler } from "@cozy/cli-tree";
import fs from "fs-extra";
import fetch from "isomorphic-unfetch";

import intConfigs from "../app/test/__fixtures/config/int/configs";

const pullConfigs = async ({
  baseUrl,
  env,
}: {
  baseUrl: string;
  env: string;
}) => {
  const fixturesDir = path.join(
    __dirname,
    "..",
    "app",
    "test",
    "__fixtures",
    env
  );

  const cyFixuresDir = path.join(__dirname, "..", "cypress", "fixtures", env);
  console.log(`Pull configs from ${baseUrl}`);
  const configs = await Promise.all(
    intConfigs.map(async ({ chartId, slug }) => {
      const url = `${baseUrl}/api/config/${chartId}`;
      const config = await (await fetch(url)).json();

      return { slug, config };
    })
  );

  await fs.ensureDir(fixturesDir);
  await fs.ensureDir(cyFixuresDir);
  await fs.emptyDir(fixturesDir);

  await Promise.all(
    configs.map(async ({ config, slug }) => {
      return fs.writeJSON(path.join(fixturesDir, `${slug}.json`), config, {
        spaces: 2,
      });
    })
  );

  console.log("Wrote configs to", fixturesDir);
};

const baseUrlArg = {
  argument: "--baseUrl",
  description: "Base URL for API",
  defaultValue: "http://localhost:3000",
};
const envArg = {
  argument: "--env",
  description: "Environment to target",
  choices: ["int", "prod"],
  defaultValue: "int",
};
const commands = {
  pull: {
    description: "Pull configs locally",
    handler: pullConfigs,
    arguments: [baseUrlArg, envArg],
  },
};

const main = async () => {
  await completionHandler(commands);
  const [parser] = build(commands);
  const args = parser.parseArgs();
  args.handler(args);
};

main().catch((e) => console.error(e));
