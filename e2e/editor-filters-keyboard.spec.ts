import { Page } from "@playwright/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import columnTwoCharts from "./fixtures/column-two-charts-chart-config.json";
import mapNfi from "./fixtures/map-nfi-chart-config.json";

const { expect, test } = setup();

test.describe("Editor filters by keyboard", () => {
  test("a filter card has a named drag handle and named switch", async ({
    page,
  }) => {
    await openEditor({ page, key: "editor-filters-names" });
    const filters = filtersSection(page);

    await expect(
      filters.getByRole("button", { name: "Reorder: 1. Kanton" })
    ).toBeVisible();
    await expect(
      filters.getByRole("checkbox", { name: "Interactive: 1. Kanton" })
    ).toBeVisible();
    await expect(
      filters.locator('[data-rbd-draggable-id][tabindex="0"]')
    ).toHaveCount(0);
  });

  test("a filter select keeps focus after choosing a value", async ({
    page,
  }) => {
    await openEditor({ page, key: "editor-filters-focus" });
    const selectId = await filtersSection(page)
      .getByRole("combobox")
      .first()
      .getAttribute("id");
    // The open menu hides the page from the accessibility tree, so use the id.
    const select = page.locator(`[id="${selectId}"]`);
    await expect(select).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 30_000,
    });

    const before = (await select.textContent()) ?? "";
    await select.focus();
    // The editor can refetch right after loading, which makes the select read only for a moment.
    await expect(async () => {
      if ((await select.getAttribute("aria-expanded")) !== "true") {
        await page.keyboard.press("ArrowDown");
      }

      await expect(select).toHaveAttribute("aria-expanded", "true", {
        timeout: 1_000,
      });
    }).toPass({ timeout: 30_000 });
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(select).not.toHaveText(before);
    await expect(select).toBeFocused();
    await expect(select).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 30_000,
    });
    await expect(select).toBeFocused();
  });

  test("a filter keeps focus on its drag handle after moving it", async ({
    page,
  }) => {
    await openEditor({
      page,
      key: "editor-filters-reorder",
      config: {
        ...mapNfi,
        activeField: undefined,
        chartConfig: { ...mapNfi.chartConfig, activeField: undefined },
      },
    });
    const handle = filtersSection(page).getByRole("button", {
      name: /^Reorder: 1\. /,
    });
    const name = (await handle.getAttribute("aria-label")) ?? "";

    await handle.focus();
    await page.keyboard.press(" ");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");

    const moved = name.replace("Reorder: 1. ", "Reorder: 2. ");
    const movedHandle = page.getByRole("button", { name: moved });
    await expect(movedHandle).toBeFocused();
    await expect(movedHandle).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 30_000,
    });
    await expect(movedHandle).toBeFocused();
  });

  test("Show Filters reports its state and the list it controls", async ({
    page,
  }) => {
    const config = structuredClone(columnTwoCharts);
    config.chartConfigs[0].interactiveFiltersConfig.dataFilters.defaultOpen =
      false;
    await openEditor({ page, key: "editor-filters-toggle", config });
    const toggle = page.getByRole("button", { name: "Show Filters" });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const listId = await toggle.getAttribute("aria-controls");
    await toggle.click();

    await expect(
      page.getByRole("button", { name: "Hide Filters" })
    ).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`#${listId}`)).toBeVisible();
  });
});

const filtersSection = (page: Page) =>
  page.locator('[data-testid="controlSection"]', {
    has: page.locator('h6:text-is("Filters")'),
  });

const openEditor = async ({
  page,
  key,
  config = columnTwoCharts,
}: {
  page: Page;
  key: string;
  config?: object;
}) => {
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
};
