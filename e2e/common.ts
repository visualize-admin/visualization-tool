import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";
import { Page, PlaywrightTestOptions, test as base } from "@playwright/test";

import { Actions, createActions } from "./actions";
import { createSelectors, Selectors } from "./selectors";
import slugify from "./slugify";

type RouteFromHAROptions = Parameters<Page["routeFromHAR"]>[1];

const setup = (contextOptions?: PlaywrightTestOptions["contextOptions"]) => {
  const test = base.extend<TestingLibraryFixtures>(fixtures).extend<{
    selectors: Selectors;
    actions: Actions;
    replayFromHAR: (routeFromHAROptions?: RouteFromHAROptions) => Promise<void>;
    auth: () => Promise<void>;
  }>({
    auth: async ({ page }, use) => {
      const auth = async () => {
        const signInBtn = page.locator('[data-testid="test-sign-in"]');
        await signInBtn.waitFor({ state: "visible", timeout: 5000 });
        await signInBtn.click();
      };
      await use(auth);
    },
    selectors: async ({ page, screen, within }, use) => {
      const ctx = { page, screen, within };
      const selectors = createSelectors(ctx);
      await use(selectors);
    },
    actions: async ({ page, screen, selectors, within }, use) => {
      const ctx = { page, screen, selectors, within };
      const actions = createActions(ctx);
      await use(actions);
    },
    replayFromHAR: async ({ page }, use, testInfo) => {
      let index = 0;
      const replay = async (routeFromHAROptions?: RouteFromHAROptions) => {
        const name = `${testInfo.titlePath
          .map((x) => x.replace(/\.spec\.ts$/, ""))
          .map((x) => x.replace(/@[^\s]+$/, ""))
          .map(slugify)
          .join(" > ")} ${index++}`;
        if (process.env.E2E_HAR && process.env.E2E_HAR !== "false") {
          await page.routeFromHAR(`./e2e/har/${name}.zip`, {
            url: /api\/graphql/,
            notFound: "abort",
            ...routeFromHAROptions,
          });
        }
      };
      await use(replay);
    },
    contextOptions,
  });

  // When running outside CI, pause Playwright when a test failed.
  // See: https://github.com/microsoft/playwright/issues/10132
  test.afterEach(async ({ page }, testInfo) => {
    if (!process.env.CI && testInfo.status !== testInfo.expectedStatus) {
      process.stderr.write(
        `❌ ❌ PLAYWRIGHT TEST FAILURE ❌ ❌\n${
          testInfo.error?.stack || testInfo.error
        }\n`
      );
      testInfo.setTimeout(0);
      await page.pause();
    }
  });

  const { expect, describe } = test;
  const it = test;

  return { test, expect, describe, it };
};

const sleep = (dur: number) => new Promise((r) => setTimeout(r, dur));

export { setup, sleep };
