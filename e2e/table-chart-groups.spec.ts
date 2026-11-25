import { Locator, Page } from "@playwright/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFire from "./fixtures/forest-fire-danger-chart-config.json";

const { expect, test } = setup();

const FIELD_IDS = Object.keys(forestFire.chartConfig.fields);
const CANTON = FIELD_IDS.find((id) => id.endsWith("/canton"))!;
const REGION = FIELD_IDS.find((id) => id.endsWith("/region"))!;

test.describe("Table chart groups", () => {
  test("the first group opens at every level on load when the setting is on", async ({
    page,
  }) => {
    await openTable({
      page,
      key: "table-groups-expanded",
      groupBy: [CANTON, REGION],
    });
    await turnOnExpandFirstGroup({ page, key: "table-groups-expanded" });
    // A new tab skips the init script that would seed the fixture again.
    const reopened = await page.context().newPage();
    await reopened.goto("/en/create/table-groups-expanded");
    await waitForTable(reopened);
    const table = reopened.getByRole("table", { name: "Table" });

    await expectOnlyFirstGroupPathOpen(table.locator("[aria-expanded]"));

    const firstGroup = table.locator("[aria-expanded]").first();
    const firstGroupName = (await firstGroup.textContent()) ?? "";
    await reopened
      .getByRole("textbox", { name: "Search table" })
      .fill(firstGroupName);
    await expect(
      table.getByRole("button", { name: firstGroupName, exact: true })
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("the first group opens in the published chart too", async ({ page }) => {
    await openTable({
      page,
      key: "table-groups-published",
      groupBy: [CANTON, REGION],
    });
    const state = await turnOnExpandFirstGroup({
      page,
      key: "table-groups-published",
    });
    await page.goto("/en/preview");
    const table = page.getByRole("table", { name: "Table" });
    // The preview only listens for the chart once it has hydrated.
    await expect(async () => {
      await page.evaluate((config) => window.postMessage(config, "*"), state);
      await table.waitFor({ timeout: 5_000 });
    }).toPass({ timeout: 60_000 });

    await expectOnlyFirstGroupPathOpen(table.locator("[aria-expanded]"));
  });

  test("all groups start closed without the setting", async ({ page }) => {
    await openTable({
      page,
      key: "table-groups-collapsed",
      groupBy: [CANTON],
    });
    const table = page.getByRole("table", { name: "Table" });

    await expect(table.locator("[aria-expanded]").first()).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(table.locator('[aria-expanded="true"]')).toHaveCount(0);
  });

  test("the editor offers the setting only for grouped tables and applies it", async ({
    page,
  }) => {
    await openTable({ page, key: "table-groups-editor-plain" });
    await expect(
      page.getByRole("checkbox", { name: "Expand first group" })
    ).toHaveCount(0);

    await openTable({
      page,
      key: "table-groups-editor",
      groupBy: [CANTON],
    });
    const firstGroup = page
      .getByRole("table", { name: "Table" })
      .locator("[aria-expanded]")
      .first();
    const setting = page.getByRole("checkbox", { name: "Expand first group" });
    await expect(firstGroup).toHaveAttribute("aria-expanded", "false");

    await setting.check();
    await expect(firstGroup).toHaveAttribute("aria-expanded", "true");

    await setting.uncheck();
    await expect(firstGroup).toHaveAttribute("aria-expanded", "false");
  });
});

const expectOnlyFirstGroupPathOpen = async (groups: Locator) => {
  await expect(groups.nth(0)).toHaveAttribute("aria-expanded", "true");
  await expect(groups.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(
    groups.and(groups.page().locator('[aria-expanded="true"]'))
  ).toHaveCount(2);
};

const makeConfig = (groupBy: string[] = []) => {
  const config = structuredClone(forestFire);
  const fields = config.chartConfig.fields as Record<
    string,
    { isGroup: boolean; index: number }
  >;

  groupBy.forEach((id, index) => {
    fields[id].isGroup = true;
    fields[id].index = index;
  });

  return config;
};

const openTable = async ({
  page,
  key,
  groupBy,
}: {
  page: Page;
  key: string;
  groupBy?: string[];
}) => {
  await loadChartInLocalStorage(page, key, makeConfig(groupBy));
  await page.goto(`/en/create/${key}`);
  await waitForTable(page);
};

const waitForTable = async (page: Page) => {
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
  await page.getByRole("table", { name: "Table" }).waitFor();
};

// The fixture predates the setting, so its migration resets it to off. The
// editor saves the migrated state, which then carries the setting.
const turnOnExpandFirstGroup = async ({
  page,
  key,
}: {
  page: Page;
  key: string;
}) => {
  await page.getByRole("checkbox", { name: "Expand first group" }).check();
  const readState = () =>
    page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      `vizualize-configurator-state:${key}`
    );
  await expect.poll(readState).toContain('"expandFirstGroup":true');

  return JSON.parse((await readState()) ?? "null");
};
