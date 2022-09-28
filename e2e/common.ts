import {
  locatorFixtures as fixtures,
  LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture";
import { test as base } from "@playwright/test";

const test = base.extend<TestingLibraryFixtures>(fixtures);
const { expect, describe } = test;
const it = test;

export const sleep = (dur: number) => new Promise((r) => setTimeout(r, dur));

export { expect, test, describe, it };
