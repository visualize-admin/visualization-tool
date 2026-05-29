import { setup } from "./common";

const { test, expect } = setup();

test("Filters should be sorted by position", async ({ selectors, actions }) => {
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd003001/10", // "Red List" of species
    dataSource: "Prod",
  });

  await selectors.edition.drawerLoaded();

  await actions.editor.selectActiveField("Segmentation");

  const selectorLocator = selectors.panels.drawer().getByRole("combobox", { name: "None" });
  await selectorLocator.click();

  await actions.mui.selectOption("Status IUCN");

  const panelLeft = selectors.panels.drawer();
  await panelLeft
    .getByText("Selected filters")
    .first()
    .waitFor({ timeout: 10_000 });

  const filtersValueLocator = panelLeft.getByTestId("chart-filters-value");
  await filtersValueLocator.first().waitFor({ timeout: 3000 });

  const rawTexts = await filtersValueLocator.allTextContents();
  const texts = rawTexts.map((x) =>
    x.replace("Open Color Picker", "").replace("Show value", "")
  );
  expect(texts).toEqual([
    "Data deficient",
    "Least concern",
    "Near threatened",
    "Vulnerable",
    "Endangered",
    "Critically endangered",
    "Regionally extinct",
  ]);
});
