import { Locator, Page } from "@playwright/test";

import { expectNoAxeViolations } from "./a11y";
import { setup } from "./common";
import columnTwoCharts from "./fixtures/column-two-charts-chart-config.json";
import mapNfi from "./fixtures/map-nfi-chart-config.json";

const { expect, test } = setup();

test.describe("Interactive data filters by keyboard", () => {
  test("a select keeps focus while the chart reloads", async ({ page }) => {
    await openWithDataFilters({
      page,
      config: columnTwoCharts,
      mode: "single",
    });
    const select = filters(page).getByRole("combobox");
    await waitUntilEnabled(select);

    await select.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(select).not.toHaveText("Zurich");
    await expect(select).toBeFocused();
    await waitUntilEnabled(select);
    await expect(select).toBeFocused();
  });

  test("a multi select opens with the arrow keys and closes with Escape", async ({
    page,
  }) => {
    await openWithDataFilters({ page, config: columnTwoCharts, mode: "multi" });
    const input = filters(page).getByRole("combobox");
    await waitUntilEnabled(input);

    await input.focus();
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeFocused();
  });

  test("a multi select still opens and closes on click", async ({ page }) => {
    await openWithDataFilters({
      page,
      config: columnTwoCharts,
      mode: "multi",
    });
    const input = filters(page).getByRole("combobox");
    await waitUntilEnabled(input);

    await input.click();
    await expect(page.getByRole("listbox")).toBeVisible();

    await input.click();
    await expect(page.getByRole("listbox")).toBeHidden();
  });

  test("a hierarchical filter is a button that opens a searchable tree dialog", async ({
    page,
  }) => {
    await openWithDataFilters({ page, config: mapNfi, mode: "single" });
    const trigger = filters(page).locator('[aria-haspopup="dialog"]');
    await waitUntilEnabled(trigger);

    await expectNoAxeViolations({
      page,
      include: '[data-testid="published-chart-interactive-filters"]',
    });

    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "tree condition" });
    await expect(dialog).toHaveCSS("opacity", "1");
    await expectNoAxeViolations({ page, include: '[role="dialog"]' });
    await expect(dialog.getByRole("textbox", { name: "Search" })).toBeFocused();

    await page.keyboard.type("(");
    await expect(page.getByRole("status").last()).toHaveText("No results");

    await page.keyboard.press("Backspace");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("tree")).toBeFocused();

    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText("Standing dead");
  });
});

const filters = (page: Page) =>
  page.getByTestId("published-chart-interactive-filters");

const waitUntilEnabled = async (locator: Locator) => {
  await expect(locator).not.toHaveAttribute("aria-disabled", "true", {
    timeout: 60_000,
  });
};

const openWithDataFilters = async ({
  page,
  config,
  mode,
}: {
  page: Page;
  config: object;
  mode: "single" | "multi";
}) => {
  const key = `data-filters-keyboard-${mode}-${Math.random().toString(36).slice(2)}`;
  const storageKey = `vizualize-configurator-state:${key}`;
  await page.goto("/en");
  await page.evaluate(
    ([k, v]) => localStorage.setItem(k, v),
    [storageKey, JSON.stringify(config)]
  );
  await page.goto(`/en/create/${key}`);
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
  await page.evaluate(
    ([k, filterType]) => {
      const state = JSON.parse(localStorage.getItem(k)!);
      const chartConfig = state.chartConfigs[0];
      const cubeFilters = chartConfig.cubes[0].filters;
      const ids = Object.keys(cubeFilters).filter(
        (id) => cubeFilters[id].type !== "range"
      );
      delete chartConfig.activeField;
      chartConfig.interactiveFiltersConfig.dataFilters = {
        ...chartConfig.interactiveFiltersConfig.dataFilters,
        active: true,
        componentIds: ids,
        filterTypes: Object.fromEntries(ids.map((id) => [id, filterType])),
        defaultOpen: true,
      };
      localStorage.setItem(k, JSON.stringify(state));
    },
    [storageKey, mode]
  );
  await page.reload();
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
  await filters(page).waitFor();
};
