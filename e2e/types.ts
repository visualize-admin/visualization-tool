import { LocatorFixtures } from "@playwright-testing-library/test/fixture";
import { Locator, Page } from "@playwright/test";

type Screen = LocatorFixtures["screen"];

export type TestContext = {
  screen: Screen;
  page: Page;
};

type SelectorOrActionFunction = (
  ctx: TestContext,
  arg1?: any,
  arg2?: any,
  arg3?: any
) => Promise<Locator> | Locator | Promise<void>;

export type SelectorOrActionGuard<T> = T extends Record<
  string,
  Record<string, SelectorOrActionFunction>
>
  ? T
  : never;

/**
 * Constrains what we can put in selectors / actions
 *
 * We use this so that we cannot put anything we want inside the selectors.
 * At the same time, T is returned so that downstream has the correct types.
 */
export const makeSelectors = <T>(selectors: SelectorOrActionGuard<T>): T =>
  selectors;
export const makeActions = <T>(actions: SelectorOrActionGuard<T>): T => actions;
