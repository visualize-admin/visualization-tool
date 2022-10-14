import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";
import { test as base } from "@playwright/test";

import { createActions, Actions } from "./actions";
import { createSelectors, Selectors } from "./selectors";

const test = base.extend<TestingLibraryFixtures>(fixtures).extend<{
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
});
const { expect, describe } = test;
const it = test;

export const sleep = (dur: number) => new Promise((r) => setTimeout(r, dur));

export { expect, test, describe, it };
