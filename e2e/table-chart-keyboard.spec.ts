import { Page } from "@playwright/test";

import { expectNoAxeViolations } from "./a11y";
import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFire from "./fixtures/forest-fire-danger-chart-config.json";

const { expect, test } = setup();

const CANTON_FIELD = Object.keys(forestFire.chartConfig.fields).find((id) =>
  id.endsWith("/canton")
)!;

test.describe("Table chart", () => {
  test("is a named table with column headers, row headers and no axe violations", async ({
    page,
  }) => {
    await openTable({ page, key: "table-semantics" });
    const table = page.getByRole("table", { name: "Table" });

    await expect(page.getByRole("table")).toHaveCount(1);
    // 143 data rows plus the header row.
    await expect(table).toHaveAttribute("aria-rowcount", "144");
    await expect(table.getByRole("columnheader")).toHaveCount(4);
    await expect(
      table.getByRole("rowheader", { name: "Canton of Aargau" })
    ).toBeVisible();
    await expectNoAxeViolations({ page, include: '[role="table"]' });
  });

  test("sorts a column by keyboard and reports it with aria-sort", async ({
    page,
  }) => {
    await openTable({ page, key: "table-sort" });
    const table = page.getByRole("table", { name: "Table" });
    const header = table.getByRole("columnheader", { name: /^Canton/ });

    await expect(header).not.toHaveAttribute("aria-sort");
    await page.getByRole("textbox", { name: "Search table" }).focus();
    // The table itself, then the label and sort buttons of each column up to Canton.
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab");
    }
    await expect(
      table.getByRole("button", { name: "Sort by Canton" })
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "ascending");

    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(
      table.getByRole("button", { name: "Sort by Canton" })
    ).toBeFocused();

    // Mouse users can still click the header to sort; the label opens the metadata panel instead.
    const { width } = (await header.boundingBox())!;
    await header.click({ position: { x: width - 4, y: 4 } });
    await expect(header).not.toHaveAttribute("aria-sort");
    await header.click({ position: { x: width - 4, y: 4 } });
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await table.getByRole("button", { name: "Canton", exact: true }).click();
    const details = page.getByRole("dialog", { name: "Details" });
    await expect(details).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();
    await expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  test("scrolls a partly hidden control fully into view when it gets focus", async ({
    page,
  }) => {
    await openTable({ page, key: "table-scroll", groupBy: CANTON_FIELD });
    const lastSortButton = page.getByRole("button", {
      name: "Sort by Danger ratings",
    });
    const firstGroup = page.getByRole("button", { name: "Zurich" });

    // Reaching the last column scrolls the table sideways, which hides part of the first group.
    await lastSortButton.focus();
    await expect(lastSortButton).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Tab");

    await expect(firstGroup).toBeFocused();
    await expect(firstGroup).toBeInViewport({ ratio: 1 });
  });

  test("expands group rows by keyboard and reaches groups below the fold with Tab", async ({
    page,
  }) => {
    await openTable({ page, key: "table-groups", groupBy: CANTON_FIELD });
    const table = page.getByRole("table", { name: "Table" });
    const firstGroup = table.getByRole("button", { name: "Zurich" });

    await expect(firstGroup).toHaveAttribute("aria-expanded", "false");
    const groupCount = Number(await table.getAttribute("aria-rowcount")) - 1;
    await firstGroup.focus();
    await page.keyboard.press("Enter");
    await expect(firstGroup).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(firstGroup).toHaveAttribute("aria-expanded", "false");

    // Mouse users can still click anywhere on the group row.
    const groupCell = firstGroup.locator("xpath=..");
    const { width } = (await groupCell.boundingBox())!;
    await groupCell.click({ position: { x: width - 20, y: 10 } });
    await expect(firstGroup).toHaveAttribute("aria-expanded", "true");
    await groupCell.click({ position: { x: width - 20, y: 10 } });
    await expect(firstGroup).toHaveAttribute("aria-expanded", "false");
    await firstGroup.focus();

    // Wait for each group to render and scroll into view, as a person would.
    for (let i = 1; i < groupCount; i++) {
      await page.keyboard.press("Tab");
      await expect(table.locator(":focus")).toBeInViewport();
    }

    const lastGroup = page.locator(":focus");
    await expect(lastGroup).toHaveAttribute("aria-expanded", "false");
    await expect(lastGroup).toBeInViewport();
    await expect(lastGroup.locator("xpath=..")).toHaveAttribute("role", "cell");
    await expect(
      lastGroup.locator("xpath=../.."),
      "the last group row is the last row of the table"
    ).toHaveAttribute("aria-rowindex", `${groupCount + 1}`);
  });

  test("keeps focus on a group in the compact view when it is toggled", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openTable({ page, key: "table-compact", groupBy: CANTON_FIELD });
    await page.getByRole("checkbox", { name: "Compact view" }).check();
    const list = page.getByRole("region", { name: "Table" });
    const firstGroup = list.getByRole("button", { name: "Zurich" });

    await firstGroup.focus();
    await page.keyboard.press("Enter");

    await expect(firstGroup).toHaveAttribute("aria-expanded", "true");
    await expect(firstGroup).toBeFocused();
    await expect(list.getByRole("listitem").nth(1)).toContainText(
      "Warning region"
    );
  });

  test("announces the number of matching rows after searching", async ({
    page,
  }) => {
    await openTable({ page, key: "table-search" });

    await page.getByRole("textbox", { name: "Search table" }).fill("Bern");

    const total = page.getByText(/^Total number of (rows|lines):/);
    await expect(total).not.toHaveText(/: 143$/);
    const matches = (await total.textContent())!.match(/(\d+)$/)![1];
    await expect(
      page.getByRole("status").filter({ hasText: /matching/ })
    ).toHaveText(`${matches} matching rows`);
  });
});

const openTable = async ({
  page,
  key,
  groupBy,
}: {
  page: Page;
  key: string;
  groupBy?: string;
}) => {
  const config = structuredClone(forestFire);

  if (groupBy) {
    const fields = config.chartConfig.fields as Record<
      string,
      { isGroup: boolean }
    >;
    fields[groupBy].isGroup = true;
  }

  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
  await page.getByRole("table", { name: "Table" }).waitFor();
};
