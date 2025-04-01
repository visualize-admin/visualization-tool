import { setup, sleep } from "./common";

const { test, expect, describe } = setup();

describe("Color Picker Swatches", () => {
  test("Color Picker Swatches for Segmentations", async ({
    page,
    selectors,
    actions,
  }) => {
    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10&dataSource=Prod"
    );
    await selectors.chart.loaded();
    await actions.editor.selectActiveField("Segmentation");
    await selectors.edition.drawerLoaded();
    await (
      await selectors.panels.drawer().within().getByLabelText("None")
    ).click();
    await actions.mui.selectOption("Kanton");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1_000);

    await page
      .getByRole("button", { name: "Open Color Picker" })
      .first()
      .click();
    await sleep(1_000);

    const colorSquare = page.getByTestId("select-color-square").first();
    await colorSquare.waitFor({ state: "visible", timeout: 5000 });
    const colorSquareBgColor = await colorSquare.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const colorPickerSwatch = page.getByTestId("color-picker-swatch").first();
    await colorPickerSwatch.waitFor({ state: "visible", timeout: 5000 });
    const colorPickerSwatchBgColor = await colorPickerSwatch.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(colorSquareBgColor).toEqual(colorPickerSwatchBgColor);
  });

  test("Color Picker Swatches for Vertical Axis", async ({
    page,
    selectors,
    actions,
  }) => {
    await page.goto(
      "/en/create/new?cube=https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10&dataSource=Prod"
    );
    await selectors.chart.loaded();
    await actions.editor.selectActiveField("Vertical Axis");

    await page
      .getByRole("button", { name: "Open Color Picker" })
      .first()
      .click();
    await sleep(1_000);

    const colorSquare = page.getByTestId("select-color-square").first();
    await colorSquare.waitFor({ state: "visible", timeout: 5000 });
    const colorSquareBgColor = await colorSquare.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const colorPickerSwatch = page.getByTestId("color-picker-swatch").first();
    await colorPickerSwatch.waitFor({ state: "visible", timeout: 5000 });
    const colorPickerSwatchBgColor = await colorPickerSwatch.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(colorSquareBgColor).toEqual(colorPickerSwatchBgColor);
  });
});
