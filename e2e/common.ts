import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";
import { test as base, PlaywrightTestOptions } from "@playwright/test";

import { Actions, createActions } from "./actions";
import { createSelectors, Selectors } from "./selectors";

export const makeTest = (
  contextOptions?: PlaywrightTestOptions["contextOptions"]
) =>
  base.extend<TestingLibraryFixtures>(fixtures).extend<{
    selectors: Selectors;
    actions: Actions;
  }>({
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
    contextOptions,
  });
const test = makeTest();
const { expect, describe } = test;
const it = test;

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

export const sleep = (dur: number) => new Promise((r) => setTimeout(r, dur));

export { describe, expect, it, test };
