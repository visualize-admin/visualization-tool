import { setup } from "./common";
import mapNFIconfig from "./fixtures/map-nfi-chart-config.json";

const { test, describe, expect } = setup();

describe("Filters", () => {
  test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
    page,
    selectors,
  }) => {
    await page.goto(
      `/en/create/new?cube=${mapNFIconfig.dataSet}&dataSource=Prod`
    );
    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    const filters = selectors.edition.controlSectionBySubtitle("Filters");

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const inputs = await filters.locator("input[name^=select-single-filter]");
    const inputsCount = await inputs.count();

    for (let i = 0; i < inputsCount; i++) {
      await expect(inputs.nth(i)).not.toBeDisabled();
    }

    const labels = filters.locator("label[for^=select-single-filter]");

    const texts = await labels.allTextContents();

    // Hierarchical dimensions should come first.
    expect(texts[0]).toEqual("1. Region ");
    expect(texts[1]).toEqual("2. tree status ");

    const productionRegionFilter =
      selectors.edition.dataFilterInput("1. Region ");

    const productionRegionFilterValue = await productionRegionFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();
    expect(productionRegionFilterValue).toEqual("Switzerland");

    const treeStatusFilter =
      selectors.edition.dataFilterInput("2. tree status ");
    const treeStatusFilterValue = await treeStatusFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();

    expect(treeStatusFilterValue).toEqual("Total");
  });

  test("Temporal filter should display values", async ({
    page,
    actions,
    selectors,
    within,
  }) => {
    test.slow();

    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/5&dataSource=Prod"
    );
    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    await actions.editor.changeChartType("Map");

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
});
