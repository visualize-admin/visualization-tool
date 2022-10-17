import { LocatorFixtures } from "@playwright-testing-library/test/fixture";
import { Page } from "@playwright/test";

type Screen = LocatorFixtures["screen"];

export type TestContext = {
  screen: Screen;
  page: Page;
  within: LocatorFixtures["within"];
};
