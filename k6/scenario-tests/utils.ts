import fs from "fs";

import { Browser, Page, test } from "@playwright/test";

type $IntentionalAny = any;

const cleanupHAR = (path: string) => {
  const data = JSON.parse(fs.readFileSync(path).toString());

  const cleanRequest = (request: $IntentionalAny) => {
    if (!request.postData) {
      return request;
    } else {
      // The extra "params" confuses k6 (when loading the entry, k6 has an empty {} body).
      // It is not present in HAR from Chrome but it is there in HAR from Playwrights.
      const { params: _params, ...keptPostData } = request.postData;
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

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
export const testAndSaveHar = async (
  name: string,
  path: string,
  run: ({ page, browser }: { page: Page; browser: Browser }) => Promise<void>
) => {
  test(name, async ({ page: defaultPage, browser }) => {
    test.slow();
    await defaultPage.close();
    const context = await browser.newContext({
      recordHar: { path },
    });
    const page = await context.newPage();

    await run({ browser, page });

    await context.close();
    console.log(`Saved HAR file from test at ${path}`);

    console.log(`Cleaning up HAR to remove postData ${path}`);
    await cleanupHAR(path);
  });
};

export const envs = [
  { name: "test", baseUrl: "https://test.visualize.admin.ch" },
  { name: "int", baseUrl: "https://int.visualize.admin.ch" },
  { name: "prod", baseUrl: "https://visualize.admin.ch" },
  {
    name: "local",
    baseUrl: "localhost",
  },
] as const;

export const getEnv = (name: string) => {
  const found = envs.find((x) => x.name === name);
  if (!found) {
    throw new Error(`Could not find environment ${name}`);
  }
  return found;
};
