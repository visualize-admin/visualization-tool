import { Page } from "@playwright/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import columnTwoCharts from "./fixtures/column-two-charts-chart-config.json";

const { expect, test } = setup();

const openEditor = async ({
  page,
  activeField,
}: {
  page: Page;
  activeField?: string;
}) => {
  const key = `keyboard-${activeField ?? "main"}`;
  const config = structuredClone(columnTwoCharts);
  config.chartConfigs[0].activeField = activeField;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await page.waitForSelector('[data-chart-loaded="true"]', { timeout: 30_000 });
};

const focused = (page: Page) => page.locator(":focus");

test.describe("Keyboard operability", () => {
  test("chart actions menu opens on its first item and activates items", async ({
    page,
  }) => {
    await openEditor({ page });
    await page.getByTestId("chart-more-button").first().focus();
    await page.keyboard.press("Enter");

    await expect(focused(page)).toHaveAttribute("role", "menuitem");
    await expect(focused(page)).toHaveText("Duplicate");

    await page.keyboard.press("ArrowDown");
    await expect(focused(page)).toHaveText("Table view");

    await page.keyboard.press("Enter");
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("delete confirmation from a menu is reachable by Tab", async ({
    page,
  }) => {
    await openEditor({ page });
    await page
      .getByTestId("chart-selection-tab")
      .first()
      .getByRole("button", { name: "More actions", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("End");
    await expect(focused(page)).toHaveText("Delete");
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Delete chart?" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("menu")).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(focused(page)).toHaveText("No");
    await page.keyboard.press("Tab");
    await expect(focused(page)).toHaveText("Yes");

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("chart-selection-tab")).toHaveCount(1);
  });

  test("add chart popover can add a chart by keyboard", async ({ page }) => {
    await openEditor({ page });
    await page.getByRole("button", { name: "Add chart" }).focus();
    await page.keyboard.press("Enter");

    const popover = page.getByRole("dialog", { name: "Add chart" });
    await expect(popover).toBeVisible();
    await expect(focused(page)).toHaveText("Columns");

    await page.keyboard.press("Tab");
    await expect(focused(page)).toHaveText("Bars");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("chart-selection-tab")).toHaveCount(3);
  });

  test("Tab leaves the rich text editor without inserting a tab", async ({
    page,
  }) => {
    await openEditor({ page, activeField: "title" });
    const editor = page.getByRole("textbox", { name: "English" });
    await editor.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Tab");

    await expect(editor).not.toBeFocused();
    expect(await editor.evaluate((e) => e.textContent)).toBe(
      "Column with filters"
    );

    await page.keyboard.press("Shift+Tab");
    await expect(editor).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(focused(page)).toHaveAttribute("aria-label", "Bold");
    await page.keyboard.press("ArrowRight");
    await expect(focused(page)).toHaveAttribute("aria-label", "Italic");
  });

  test("color palette select works with the keyboard", async ({ page }) => {
    await openEditor({ page, activeField: "segment" });
    const drawer = page.getByTestId("panel-drawer");
    await drawer.getByRole("combobox").first().focus();
    await page.keyboard.press("Enter");
    await page.getByRole("option", { name: "Kanton" }).focus();
    await page.keyboard.press("Enter");

    const palette = drawer.getByRole("combobox", { name: "Color palette" });
    await palette.focus();
    await page.keyboard.press("Enter");
    await expect(focused(page)).toHaveAttribute("role", "option");
    await expect(
      page.getByRole("option", { name: /color palettes/ })
    ).toHaveCount(0);
    await page.keyboard.press("ArrowDown");
    const next = await focused(page).getAttribute("data-value");
    await page.keyboard.press("Enter");

    await expect(palette).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(
              localStorage.getItem(
                "vizualize-configurator-state:keyboard-segment"
              ) ?? "{}"
            ).chartConfigs[0].fields.color.paletteId
        )
      )
      .toBe(next);
  });

  test("color picker is operable by keyboard", async ({ page }) => {
    await openEditor({ page, activeField: "segment" });
    const drawer = page.getByTestId("panel-drawer");
    await drawer.getByRole("combobox").first().focus();
    await page.keyboard.press("Enter");
    await page.getByRole("option", { name: "Kanton" }).focus();
    await page.keyboard.press("Enter");

    const opener = drawer.getByRole("button", {
      name: "Open color picker: Zurich",
    });
    await opener.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Color picker" });
    await expect(dialog).toBeVisible();
    const saturation = dialog.getByRole("slider", {
      name: "Saturation and brightness",
    });
    await expect(saturation).toBeFocused();

    const hex = dialog.getByRole("textbox", { name: "Hex color" });
    const before = await hex.inputValue();
    await page.keyboard.press("Shift+ArrowRight");
    await expect(hex).not.toHaveValue(before);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("Escape closes the edit filters drawer", async ({ page }) => {
    await openEditor({ page, activeField: "segment" });
    const drawer = page.getByTestId("panel-drawer");
    await drawer.getByRole("combobox").first().focus();
    await page.keyboard.press("Enter");
    await page.getByRole("option", { name: "Kanton" }).focus();
    await page.keyboard.press("Enter");

    const editFilters = drawer.getByRole("button", { name: "Edit filters" });
    await editFilters.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("edition-filters-drawer")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("edition-filters-drawer")).toBeHidden();
    await expect(editFilters).toBeFocused();
  });

  test("time range brush handles move with arrow keys", async ({ page }) => {
    await openEditor({ page });
    const from = page.locator(".handle--w").first();
    await from.focus();
    const before = await from.getAttribute("aria-valuetext");

    await page.keyboard.press("ArrowRight");
    await expect(from).not.toHaveAttribute("aria-valuetext", before!);

    await page.keyboard.press("ArrowLeft");
    await expect(from).toHaveAttribute("aria-valuetext", before!);
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/en");
    await page
      .getByRole("link", { name: "Skip to main content" })
      .waitFor({ state: "attached" });
    await page.keyboard.press("Tab");
    await expect(focused(page)).toHaveText("Skip to main content");

    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
});
