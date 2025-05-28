import flatten from "lodash/flatten";

import { configs as intTestConfigs } from "./__fixtures/config/int/configs";
import { configs as prodTestConfigs } from "./__fixtures/config/prod/configs";

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
