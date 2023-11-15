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

    const labels = filters.locator("label[for^=select-single-filter]");

    const texts = await labels.allTextContents();

    console.log(texts);
    // Hierarchical dimensions should come first.
    expect(texts[0]).toEqual("1. Region");
    expect(texts[1]).toEqual("2. tree status");

    const productionRegionFilter =
      selectors.edition.dataFilterInput("1. Region");

    const productionRegionFilterValue = await productionRegionFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();
    expect(productionRegionFilterValue).toEqual(
      "https://ld.admin.ch/country/CHE"
    );

    const treeStatusFilter =
      selectors.edition.dataFilterInput("2. tree status");
    const treeStatusFilterValue = await treeStatusFilter
      .locator("input[name^=select-single-filter]")
      .inputValue();

    expect(treeStatusFilterValue).toEqual(
      "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total"
    );
  });

  test("Temporal filter should display all values", async ({
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

    const labels = filters.locator("label[for^=select-single-filter]");

    const texts = await labels.allTextContents();
    expect(texts).toEqual(["1. Jahr der Vergütung"]);

    const yearFilter = await within(filters).findByText("2014");
    await yearFilter.click();

    const options = await selectors.mui.options().allInnerTexts();

    expect(options.length).toEqual(9);
  });
});
