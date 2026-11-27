import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFire from "./fixtures/forest-fire-danger-chart-config.json";

const { expect, test } = setup();

test("a table column can show abbreviations instead of labels", async ({
  page,
}) => {
  await loadChartInLocalStorage(page, "table-abbreviations", forestFire);
  await page.goto("/en/create/table-abbreviations");
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });
  const table = page.getByRole("table", { name: "Table", includeHidden: true });
  const cantonCell = (name: string) =>
    table.getByText(name, { exact: true }).first();
  await expect(cantonCell("Aargau")).toBeVisible();

  await page.getByRole("tab", { name: "Canton" }).click();
  const checkbox = page.getByRole("checkbox", { name: "Use abbreviations" });
  await expect(checkbox).toBeEnabled();

  await checkbox.check();
  await expect(cantonCell("AG")).toBeVisible();
  await expect(cantonCell("Aargau")).toHaveCount(0);

  await page.keyboard.press("Escape");
  const search = page.getByRole("textbox", { name: "Search table" });
  await search.fill("ZH");
  await expect(cantonCell("ZH")).toBeVisible();
  await expect(cantonCell("AG")).toHaveCount(0);
  await search.fill("");

  await page.getByRole("button", { name: "Sort by Canton" }).click();
  await expect(table.getByRole("row").nth(1)).toContainText("ZH");

  await page.getByRole("tab", { name: "Canton" }).click();
  await page.getByRole("checkbox", { name: "Use as group" }).check();
  await expect(
    table.getByRole("button", { name: "ZH", exact: true, includeHidden: true })
  ).toBeVisible();

  await page.getByRole("checkbox", { name: "Use as group" }).uncheck();
  await checkbox.uncheck();
  await expect(cantonCell("Zurich")).toBeVisible();
});

test("the abbreviations option is off for columns without abbreviations", async ({
  page,
}) => {
  await loadChartInLocalStorage(page, "table-no-abbreviations", forestFire);
  await page.goto("/en/create/table-no-abbreviations");
  await page.waitForSelector('[data-chart-loaded="true"]', {
    timeout: 60_000,
  });

  await page.getByRole("tab", { name: "Warning region" }).click();

  await expect(
    page.getByRole("checkbox", { name: "Use abbreviations" })
  ).toBeDisabled();
});
