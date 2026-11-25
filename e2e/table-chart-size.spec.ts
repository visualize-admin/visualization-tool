import { Locator, Page } from "@playwright/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFire from "./fixtures/forest-fire-danger-chart-config.json";

const { expect, test } = setup();

const CANTON =
  "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/canton";
// Ticino has three warning regions, so the table has three rows.
const TICINO = "https://ld.admin.ch/canton/21";
// Scrollbars that take up space, as on Windows, instead of macOS overlay scrollbars.
const CLASSIC_SCROLLBARS =
  "::-webkit-scrollbar { width: 15px; height: 15px; } ::-webkit-scrollbar-thumb { background: #888; }";

// Headless Chromium hides all scrollbars by default.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test.describe("Table chart size", () => {
  for (const { width, overflows } of [
    { width: 1280, overflows: false },
    { width: 1000, overflows: true },
  ]) {
    test(`a small table fits its rows without scrollbars at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await openTable({ page, key: `table-size-${width}`, canton: TICINO });
      const table = page.getByRole("table", { name: "Table" });
      await expect(table).toHaveAttribute("aria-rowcount", "4");

      await expect
        .poll(() => measure(table))
        .toEqual({
          horizontalOverflow: overflows,
          horizontalScrollbar: overflows,
          verticalOverflow: false,
          lastRowVisible: true,
          blankSpace: 0,
          containerScrolls: false,
        });
    });
  }

  test("a grouped table grows when a group opens and keeps its height while searching", async ({
    page,
  }) => {
    await openTable({
      page,
      key: "table-size-grouped",
      canton: TICINO,
      groupBy: CANTON,
    });
    const table = page.getByRole("table", { name: "Table" });
    await expect(table).toHaveAttribute("aria-rowcount", "2");

    await table.getByRole("button", { name: "Ticino" }).click();
    await expect(table).toHaveAttribute("aria-rowcount", "5");
    await expect
      .poll(() => measure(table))
      .toMatchObject({ verticalOverflow: false, blankSpace: 0 });
    const expandedHeight = await table.evaluate((t) => t.offsetHeight);

    await page.getByRole("textbox", { name: "Search table" }).fill("Northern");
    await expect(table).not.toHaveAttribute("aria-rowcount", "5");
    expect(await table.evaluate((t) => t.offsetHeight)).toBe(expandedHeight);
  });

  test("a large table is capped and scrolls inside itself", async ({
    page,
  }) => {
    await openTable({ page, key: "table-size-large" });
    const table = page.getByRole("table", { name: "Table" });

    await expect
      .poll(() => measure(table))
      .toMatchObject({ verticalOverflow: true, containerScrolls: false });
    expect(await table.evaluate((t) => t.clientHeight)).toBe(600);
  });

  test("the compact view fits its rows", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await openTable({ page, key: "table-size-compact", canton: TICINO });
    await page.getByRole("checkbox", { name: "Compact view" }).check();
    const list = page.getByRole("region", { name: "Table" });

    await expect
      .poll(() =>
        list.evaluate((element) => ({
          verticalOverflow: element.scrollHeight > element.clientHeight,
          blankSpace: element.clientHeight - element.scrollHeight,
        }))
      )
      .toEqual({ verticalOverflow: false, blankSpace: 0 });
  });
});

const openTable = async ({
  page,
  key,
  canton,
  groupBy,
}: {
  page: Page;
  key: string;
  canton?: string;
  groupBy?: string;
}) => {
  const config = structuredClone(forestFire);
  const chartConfig = config.chartConfig as {
    filters: object;
    fields: Record<string, { isGroup: boolean }>;
  };

  if (canton) {
    chartConfig.filters = { [CANTON]: { type: "single", value: canton } };
  }

  if (groupBy) {
    chartConfig.fields[groupBy].isGroup = true;
  }

  await page.addInitScript((css) => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.append(style);
    });
  }, CLASSIC_SCROLLBARS);
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
};

const measure = (table: Locator) => {
  return table.evaluate((element) => {
    const rows = element.querySelectorAll('[role="row"][aria-rowindex]');
    const header = element.querySelector('[role="rowgroup"]')!;
    const lastRow = rows[rows.length - 1].getBoundingClientRect();
    const rowsHeight = [...rows]
      .slice(1)
      .reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);
    const visibleBottom =
      element.getBoundingClientRect().top +
      element.clientTop +
      element.clientHeight;
    let container = element.parentElement;

    while (container && getComputedStyle(container).overflowY === "visible") {
      container = container.parentElement;
    }

    return {
      horizontalOverflow: element.scrollWidth > element.clientWidth,
      horizontalScrollbar: element.offsetHeight > element.clientHeight,
      verticalOverflow: element.scrollHeight > element.clientHeight,
      lastRowVisible: lastRow.bottom <= visibleBottom + 0.5,
      blankSpace: Math.round(
        element.clientHeight -
          header.getBoundingClientRect().height -
          rowsHeight
      ),
      containerScrolls: container
        ? container.scrollHeight > container.clientHeight
        : false,
    };
  });
};
