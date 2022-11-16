import { describe, test, expect } from "./common";

describe("Filters", () => {
  test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
    page,
    selectors,
  }) => {
    await page.goto(
      `/en/create/new?cube=https://environment.ld.admin.ch/foen/nfi/49-19-44/cube/1&dataSource=Int`
    );
    await selectors.chart.loaded();

    const filters = selectors.edition.controlSection("Filters");

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const labels = filters.locator("label");

    const texts = await labels.allTextContents();
    expect(texts).toEqual([
      "1. production region",
      "2. stand structure",
      "3. evaluation type",
      "4. unit of evaluation",
      "5. grid",
    ]);
  });

  test("Temporal filter should display all values", async ({
    page,
    actions,
    selectors,
    within,
  }) => {
    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/5&dataSource=Prod"
    );
    await selectors.chart.loaded();

    await actions.editor.changeChartType("Map");

    const filters = await selectors.edition.configFilters();

    await filters.locator("label").first().waitFor({ timeout: 30_000 });

    const labels = filters.locator("label");

    const texts = await labels.allTextContents();
    expect(texts).toEqual(["1. Jahr der Vergütung"]);

    const yearFilter = await within(filters).findByText("2014");
    await yearFilter.click();

    const options = await selectors.mui.options().allInnerTexts();

    expect(options.length).toEqual(8);
  });
});
