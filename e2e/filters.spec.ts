import { setup } from "./common";
import configuratorState from "./fixtures/map-nfi-chart-config.json";

const { test, describe, expect } = setup();

describe("Filters", () => {
  test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
    page,
    selectors,
  }) => {
    await page.goto(
      `/en/create/new?cube=${configuratorState.dataSet}&dataSource=Prod`
    );
    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    const filters = selectors.edition.controlSectionBySubtitle("Filters");

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const inputs = await filters.locator("input[name^=select-single-filter]");
    const inputsCount = await inputs.count();

    for (let i = 0; i < inputsCount; i++) {
      await expect(inputs.nth(i)).not.toBeDisabled({
        timeout: 10_000,
      });
    }

    const labels = filters.locator("label[for^=select-single-filter]");

    const texts = await labels.allTextContents();

    // Hierarchical dimensions should come first.
    expect(texts[0]).toEqual("1. Region ");
    expect(texts[1]).toEqual("2. tree condition ");

    const productionRegionFilter =
      selectors.edition.dataFilterInput("1. Region ");

    const productionRegionFilterValue = await productionRegionFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();
    expect(productionRegionFilterValue).toEqual("Switzerland");

    const treeStatusFilter =
      selectors.edition.dataFilterInput("2. tree condition ");
    const treeStatusFilterValue = await treeStatusFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();

    expect(treeStatusFilterValue).toEqual("Total");
  });

  test("Temporal filter should display values", async ({
    page,
    actions,
    selectors,
  }) => {
    test.slow();

    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10&dataSource=Prod"
    );
    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    await actions.editor.changeRegularChartType("Map");

    const filters = await selectors.edition.configFilters();

    await filters.locator("label").first().waitFor({ timeout: 30_000 });
    await page
      .getByRole("button", {
        name: "Choose date, selected date is 1 Jan 2014",
        exact: true,
      })
      .click();

    for (let year of Array.from({ length: 9 })
      .fill(null)
      .map((_, i) => `${2014 + i}`)) {
      await page.getByRole("button", { name: year, exact: true });
    }
    await page.getByRole("button", { name: "2014", exact: true }).click();
  });
  test("Show legend titles, should toggle legend titles visibility", async ({
    page,
    actions,
    selectors,
  }) => {
    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10&dataSource=Prod"
    );
    await selectors.chart.loaded();

    await actions.editor.selectActiveField("Segmentation");

    await selectors.edition.drawerLoaded();

    await (await selectors.panels.drawer().within().findByText("None")).click();

    await actions.mui.selectOption("Kanton");

    const legend = page.locator('[data-testid="legendTitle"]');

    await legend.waitFor({ state: "hidden", timeout: 5000 });
    await expect(legend).toHaveCount(0);

    await (
      await selectors.panels.drawer().within().findByText("Show legend titles")
    ).click();

    expect(legend).toHaveCount(1);

    await page.waitForTimeout(1000);
  });
});
