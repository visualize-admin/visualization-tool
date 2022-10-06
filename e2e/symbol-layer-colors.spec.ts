import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect } from "./common";
import mapWaldflascheChartConfigFixture from "./fixtures/map-waldflasche-chart-config.json";
import selectors from "./selectors";

test("Selecting SymbolLayer colors> should be possible to select nominal dimension and see a legend", async ({
  page,
  screen,
}) => {
  const ctx = { page, screen };

  const key = "jky5IEw6poT3";
  const config = mapWaldflascheChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);

  await selectors.chart.loaded(ctx);

  await (
    await screen.findByText("Symbols", undefined, { timeout: 15000 })
  ).click();

  const selects = await (
    await selectors.panels.right(ctx)
  ).locator(".MuiSelect-select");

  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const select = await selects.nth(i);
    expect(await select.getAttribute("class")).toContain("Mui-disabled");
  }

  await (await screen.findByText("Show layer")).click();
  await (await screen.findByText("None")).click();

  await selectors.edition
    .filterCheckbox(ctx, "https://environment.ld.admin.ch/foen/nfi/inventory")
    .click();

  expect(
    await (await selectors.chart.colorLegend(ctx)).locator("div").count()
  ).toBe(4);
});
