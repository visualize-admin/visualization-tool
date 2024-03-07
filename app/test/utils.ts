import * as path from "path";

import * as fs from "fs-extra";
import flatten from "lodash/flatten";

import intTestConfigs from "./__fixtures/config/int/configs";
import prodTestConfigs from "./__fixtures/config/prod/configs";
import { TestConfig } from "./__fixtures/config/types";

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

/** Used to mock fetch */
export class Response {
  body: ReadableStream<Uint8Array>;
  ok: boolean;
  status: number;
  redirected: false;
  statusText: string;
  type: ResponseType;
  url: string;
  bodyUsed: boolean;
  headers: Headers;
  constructor(body: string) {
    // @ts-ignore
    this.body = body;
    this.ok = true;
    this.redirected = false;
    this.status = 200;
    this.statusText = "OK";
    this.type = "basic";
    this.url = "";
    this.bodyUsed = false;
    this.headers = new Headers();
  }
  async json() {
    // @ts-ignore
    return JSON.parse(this.body);
  }
  async text() {
    return this.body.toString();
  }
  async arrayBuffer() {
    return new ArrayBuffer(0);
  }
  clone() {
    return this;
  }
  async blob() {
    return new Blob();
  }
  async formData() {
    return new FormData();
  }
}
