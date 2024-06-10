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
    const kantonDimensionDescription = await selectors.panels
      .metadata()
      .within()
      .findByText("Kanton, in welchem die geförderten Anlagen stehen");

    expect(kantonDimensionDescription).toBeDefined();
  };

  const chartFilters = await selectors.edition.chartFilters();

  await chartFilters.locator("button >> text='Kanton'").click();

  await checkKantonDescription();

  await actions.metadataPanel.toggle();

  const configFilters = await selectors.edition.configFilters();

  await configFilters.locator("button >> text='1. Kanton'").click();

  await checkKantonDescription();
});
