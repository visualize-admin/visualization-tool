import { expectNoAxeViolations } from "./a11y";
import { setup } from "./common";

const { test, expect } = setup();

test("it should be possible to open a metadata panel by clicking on elements in the editor", async ({
  actions,
  selectors,
}) => {
  await actions.chart.createFrom({
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/6",
    dataSource: "Prod",
  });

  const checkKantonDescription = async () => {
    await expect(
      selectors.panels
        .metadata()
        .getByText("Kanton, in welchem die geförderten Anlagen stehen")
        .first()
    ).toBeVisible();
  };

  const chartFilters = selectors.edition.chartFilters();

  await chartFilters.locator("button >> text='Kanton'").click();

  await checkKantonDescription();

  await actions.metadataPanel.toggle();

  const configFilters = await selectors.edition.configFilters();

  await configFilters.locator("button >> text='1. Kanton'").click();

  await checkKantonDescription();
});

test("metadata panel should be an accessible dialog", async ({
  actions,
  page,
}) => {
  await actions.chart.createFrom({
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/6",
    dataSource: "Prod",
  });

  const toggle = page.getByTestId("panel-metadata-toggle");
  await toggle.click();

  const dialog = page.getByRole("dialog", { name: "Details" });
  await expect(dialog).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

  await dialog.getByRole("tab", { name: "Data" }).click();
  const dataPanel = dialog.getByRole("tabpanel", { name: "Data" });
  const showMore = dataPanel.getByRole("button", { name: /^Show more ?: / });
  await expect(showMore.first()).toBeVisible();
  await expect(dataPanel.getByRole("link")).toHaveCount(0);
  await expect(dataPanel.locator("..")).toHaveCSS("opacity", "1");
  await expect(dataPanel.locator(":scope > div")).toHaveCSS("opacity", "1");
  await expectNoAxeViolations({
    page,
    include: "[data-testid=panel-metadata]",
  });

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});
