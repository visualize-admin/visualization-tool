import { within } from "@playwright-testing-library/test";
import { Locator } from "@playwright/test";

import { test, expect } from "./common";

const getSelectValue = async (locator: Locator) => {
  return locator.evaluate((ev) => (ev as HTMLSelectElement).value);
};

test("should be possible to open a search URL, and search state should be recovered", async ({
  page,
  selectors,
}) => {
  test.slow();

  await page.goto(
    `/en/browse?includeDrafts=true&order=SCORE&search=category&dataSource=Int`
  );
  await selectors.search.resultsCount();

  expect(await selectors.search.searchInput().getAttribute("value")).toEqual(
    "category"
  );

  expect(await selectors.search.draftsCheckbox().getAttribute("checked")).toBe(
    ""
  );
});

test("search results count coherence", async ({ page, selectors }) => {
  test.slow();

  const categories = [
    "Administration",
    "Agriculture, forestry",
    "Finances",
    "Territory and environment",
  ];

  const themes = [
    "Federal Office for the Environment FOEN",
    "Swiss Federal Archives SFA",
    "Swiss Federal Office of Energy SFOE",
  ];

  for (let t of [...categories, ...themes]) {
    await page.goto("/en/browse?dataSource=Int");
    await selectors.search.resultsCount();

    const panelLeft = await selectors.panels.left();
    await (await within(panelLeft).findByText("Show all")).click();

    await within(panelLeft).findByText(t, undefined, { timeout: 5000 });

    const countChip = panelLeft.locator(`:text("${t}") + *`);

    const count = await countChip.textContent();
    await panelLeft.locator(`:text("${t}")`).click();

    await page
      .locator(`:text("${count} datasets")`)
      .waitFor({ timeout: 10000 });
  }
});

test("sort order", async ({ page, selectors, screen, actions }) => {
  await page.goto("/en/browse?dataSource=Int");
  const resultCount = await selectors.search.resultsCount();
  const text = await resultCount.textContent();
  // Custom MUI select element; uses an input element under the hood
  const select = selectors.search.datasetSort().locator("input");

  expect(await getSelectValue(select)).toBe("CREATED_DESC");

  const searchInput = screen.getAllByPlaceholderText(
    "Name, organization, keyword..."
  );

  // Search something, order should be score
  await searchInput.type("NFI");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("SCORE");

  // Clear via input
  await searchInput.selectText();
  await page.keyboard.press("Delete");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("CREATED_DESC");

  // Search again
  await searchInput.type("NFI");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("SCORE");

  // Clear via button
  await actions.search.clear();
  expect(await getSelectValue(select)).toBe("CREATED_DESC");
  expect(await searchInput.getAttribute("value")).toEqual("");

  // Search again
  await searchInput.type("NFI");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("SCORE");

  // Select another order, clear, then search. Using fill due to the select
  // being custom MUI implementation
  await select.fill("TITLE_ASC");
  await actions.search.clear();
  await searchInput.type("NFI");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("TITLE_ASC");

  // Select another order, clear, then search, order should be back
  // to previous order
  await select.fill("SCORE");
  await actions.search.clear();
  expect(await getSelectValue(select)).toBe("CREATED_DESC");
  await searchInput.type("NFI");
  await page.keyboard.press("Enter");
  expect(await getSelectValue(select)).toBe("SCORE");
});
