import { within } from "@playwright-testing-library/test";
import { Locator, Page } from "@playwright/test";

import { setup } from "./common";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";
import { Selectors } from "./selectors";

const { test, expect } = setup();

const getSelectValue = async (locator: Locator) => {
  return locator.evaluate((ev) => (ev as HTMLSelectElement).value);
};

test("should be possible to open a search URL, and search state should be recovered", async ({
  page,
  selectors,
  replayFromHAR,
}) => {
  await replayFromHAR();

  await page.goto(
    `/en/browse?includeDrafts=true&order=SCORE&search=category&dataSource=Int&${harReplayGraphqlEndpointQueryParam}`
  );
  await selectors.search.resultsCount();

  expect(await selectors.search.searchInput().getAttribute("value")).toEqual(
    "category"
  );

  expect(await selectors.search.draftsCheckbox().getAttribute("checked")).toBe(
    ""
  );
});

test("search results count coherence", async ({
  page,
  selectors,
  replayFromHAR,
}) => {
  test.slow();
  await replayFromHAR();

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

  for (const t of [...categories, ...themes]) {
    await page.goto(
      `/en/browse?dataSource=Int&${harReplayGraphqlEndpointQueryParam}`
    );
    await selectors.search.resultsCount();

    const panelLeft = await selectors.panels.left();
    await (await within(panelLeft).getAllByText("Show all")[0]).click();

    await within(panelLeft).findByText(t, undefined, { timeout: 10_000 });

    const countChip = panelLeft.locator(`:text("${t}") + *`);

    const count = await countChip.textContent();
    await panelLeft.locator(`:text("${t}")`).click();

    await page
      .locator(`:text("${count} datasets")`)
      .waitFor({ timeout: 10000 });
  }
});

test("sort order", async ({
  page,
  selectors,
  screen,
  actions,
  replayFromHAR,
}) => {
  test.slow();

  await replayFromHAR();
  await page.goto(
    `/en/browse?dataSource=Int&${harReplayGraphqlEndpointQueryParam}`
  );
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

const getResultCountForSearch = async (
  search: string,
  {
    page,
    selectors,
    locale,
  }: { page: Page; selectors: Selectors; locale: string }
) => {
  await page.goto(
    `/${locale}/browse?search=${encodeURIComponent(
      search
    )}&dataSource=Prod&${harReplayGraphqlEndpointQueryParam}`
  );
  const resultCount = await selectors.search.resultsCount();
  const count = (await resultCount.textContent())?.split(" ")[0];
  expect(count).toBeTruthy();

  return count;
};

test("sort order consistency", async ({ page, selectors, replayFromHAR }) => {
  test.slow();

  await replayFromHAR();

  const count1 = await getResultCountForSearch("wasser wald", {
    locale: "en",
    page,
    selectors,
  });
  const count2 = await getResultCountForSearch("wald wasser", {
    locale: "en",
    page,
    selectors,
  });

  expect(count1).toEqual(count2);
});

test("sort language consistency", async ({
  page,
  selectors,
  replayFromHAR,
}) => {
  test.slow();
  await replayFromHAR();
  const count1 = await getResultCountForSearch("wasser", {
    locale: "en",
    page,
    selectors,
  });
  const count2 = await getResultCountForSearch("wasser", {
    locale: "de",
    page,
    selectors,
  });
  const count3 = await getResultCountForSearch("wasser", {
    locale: "fr",
    page,
    selectors,
  });
  const count4 = await getResultCountForSearch("wasser", {
    locale: "it",
    page,
    selectors,
  });

  expect(count1).toEqual(count2);
  expect(count1).toEqual(count3);
  expect(count1).toEqual(count4);

  const count5 = await getResultCountForSearch("water", {
    locale: "en",
    page,
    selectors,
  });
  const count6 = await getResultCountForSearch("eaux", {
    locale: "de",
    page,
    selectors,
  });
  const count7 = await getResultCountForSearch("acque", {
    locale: "fr",
    page,
    selectors,
  });
  const count8 = await getResultCountForSearch("water", {
    locale: "it",
    page,
    selectors,
  });

  expect(count5).toEqual(count6);
  expect(count5).toEqual(count7);
  expect(count5).toEqual(count8);
});

test("no results", async ({ page, replayFromHAR }) => {
  await replayFromHAR();
  await page.goto(
    `/en/browse?dataSource=Int&search=foofoo&${harReplayGraphqlEndpointQueryParam}`
  );
  await page.locator(`:text("No results")`).waitFor({ timeout: 10_000 });
});
