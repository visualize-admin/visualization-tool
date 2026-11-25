import { setup } from "./common";
import { expectVisibleFocusRings } from "./focus";

const { test } = setup();

const RED_LIST_CUBE = "https://environment.ld.admin.ch/foen/ubd003001/10";

test.describe("keyboard focus", () => {
  test("is visible on every focus stop in the chart editor", async ({
    page,
    actions,
  }) => {
    await actions.chart.createFrom({ iri: RED_LIST_CUBE, dataSource: "Prod" });
    await expectVisibleFocusRings({ page });
  });

  test("is visible on every focus stop in forced colors mode", async ({
    page,
    actions,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await actions.chart.createFrom({ iri: RED_LIST_CUBE, dataSource: "Prod" });
    await expectVisibleFocusRings({ page });
  });

  test("is visible on every focus stop of the layout step", async ({
    page,
    actions,
    selectors,
  }) => {
    await actions.chart.createFrom({ iri: RED_LIST_CUBE, dataSource: "Prod" });
    await (await selectors.chart.moreButton()).click();
    await selectors.mui.popover().getByText("Duplicate").click();
    await page.locator("button:has-text('Proceed to layout options')").click();
    await selectors.chart.loaded();
    await expectVisibleFocusRings({ page });
  });

  test("is visible on every focus stop of the browse page", async ({
    page,
  }) => {
    await page.goto("/en/browse");
    await page.locator("footer").waitFor();
    await expectVisibleFocusRings({ page });
  });

  test("is visible on every focus stop of the dataset preview", async ({
    page,
  }) => {
    await page.goto(
      `/en/browse?dataset=${encodeURIComponent(RED_LIST_CUBE)}&dataSource=Prod`
    );
    await page.getByRole("table").waitFor();
    await page.waitForFunction(
      () => !document.querySelector("main [style*='overflow: hidden']")
    );
    await expectVisibleFocusRings({ page });
  });

  test("is visible on every focus stop of the home page", async ({ page }) => {
    await page.goto("/en");
    await page.locator("footer").waitFor();
    await expectVisibleFocusRings({ page });
  });
});
