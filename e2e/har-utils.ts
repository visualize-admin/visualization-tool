import * as fs from "fs";

import { setup } from "./common";

type $IntentionalAny = any;

const cleanupHAR = (path: string) => {
  const data = JSON.parse(fs.readFileSync(path).toString());

  const cleanRequest = (request: $IntentionalAny) => {
    if (!request.postData) {
      return request;
    } else {
      // The extra "params" confuses k6 (when loading the entry, k6 has an empty {} body).
      // It is not present in HAR from Chrome but it is there in HAR from Playwrights.
      const { params, ...keptPostData } = request.postData;

      return {
        ...request,
        postData: keptPostData,
      };
    }
  };

  const cleanEntry = (entry: $IntentionalAny) => {
    return {
      ...entry,
      request: cleanRequest(entry.request),
    };
  };

  const transformed = {
    ...data,
    log: {
      ...data.log,
      entries: data.log.entries.map(cleanEntry),
    },
  };

  fs.writeFileSync(path, JSON.stringify(transformed, null, 2));
};

export const testAndSaveHar = async (
  env: EnvType,
  name: string,
  path: string,
  run: (props: any) => Promise<void>
) => {
  const { baseUrl } = getEnv(env);
  const { test } = setup({ recordHar: { path } });
  test.slow();
  test(name, async ({ browser, page, screen, actions, selectors, within }) => {
    await run({ browser, page, screen, selectors, actions, within, baseUrl });
    cleanupHAR(path);
  });
};

type EnvType = "test" | "int" | "prod" | "local";

export const envs: { name: EnvType; baseUrl: string }[] = [
  { name: "test", baseUrl: "https://test.visualize.admin.ch" },
  { name: "int", baseUrl: "https://int.visualize.admin.ch" },
  { name: "prod", baseUrl: "https://visualize.admin.ch" },
  { name: "local", baseUrl: "localhost" },
];

export const getEnv = (name: string) => {
  const found = envs.find((x) => x.name === name);

  if (!found) {
    throw Error(`Could not find environment ${name}`);
  }

  return found;
};

/**
 * HAR traces have been saved on http://localhost:3000. Even if we are targeting
 * our E2E tests on a Vercel Preview URL, we still want the client to make the
 * request to http://localhost:3000 so that Playwrights' HAR replay is used.
 */

export const harReplayGraphqlEndpointQueryParam =
  process.env.E2E_HAR && process.env.E2E_HAR !== "false"
    ? `flag__graphql.endpoint=${encodeURIComponent(
        JSON.stringify(`http://localhost:3000/api/graphql`)
      )}`
    : "";
