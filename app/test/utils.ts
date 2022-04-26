import * as path from "path";

import * as fs from "fs-extra";
import { flatten } from "lodash";

import intTestConfigs from "./__fixtures/int/configs";
import prodTestConfigs from "./__fixtures/prod/configs";
import { TestConfig } from "./__fixtures/types";

// Needs to be relative to CWD because webpack will replace __dirname with "/"
const FIXTURES_DIR = path.join("app", "test", "__fixtures");

const configsPerEnv = {
  int: intTestConfigs,
  prod: prodTestConfigs,
};

export const loadFixtureConfigs = () => {
  return flatten(
    Object.entries(configsPerEnv).map(([env, testConfigs]) => {
      return testConfigs.map((x) => ({ env, ...x }));
    })
  );
};

const configs = loadFixtureConfigs();

export const loadFixtureConfigIdsSync = () => {
  const configFiles = fs.readdirSync(FIXTURES_DIR);
  return configFiles.map((f) => path.basename(f, ".json"));
};

export const loadFixtureConfig = async (
  config: TestConfig & { env: string }
) => {
  return fs.readJSONSync(
    path.join(FIXTURES_DIR, config.env, `${config.slug}.json`)
  );
};

type FindFixtureConfigOptions = {
  env: string;
  slug: string;
};
export const findFixtureConfig = async ({
  env: envParam,
  slug: slugParam,
}: FindFixtureConfigOptions) => {
  const testConfig = configs.find(
    ({ slug, env }) => env === envParam && slug === slugParam
  );
  return testConfig;
};
