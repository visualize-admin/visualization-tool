import { setup } from "./common";

const { test, expect } = setup();

test("Filters should be sorted by position", async ({ selectors, actions }) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/ubd003001/14",
    "Int"
  );

  await selectors.edition.drawerLoaded();

  await actions.editor.selectActiveField("Segmentation");

  const selectorLocator = await selectors.panels
    .drawer()
    .within()
    .findByText("None");
  await selectorLocator.click();

  await actions.mui.selectOption("Status");

  const panelRight = await selectors.panels.drawer().within();
  await panelRight.findByText("Selected filters", undefined, {
    timeout: 10_000,
  });

  const filtersValueLocator = await panelRight.findAllByTestId(
    "chart-filters-value",
    undefined,
    {
      timeout: 3000,
    }
  );

  const rawTexts = await filtersValueLocator.allTextContents();
  const texts = rawTexts.map((x) => x.replace("Open Color Picker", ""));
  expect(texts).toEqual([
    "Data deficient",
    "Least concern",
    "Near threatened",
    "Vulnerable",
    "Endangered",
    "Critically endangered",
    "Regionally extinct",
    "Extinct in the world",
  ]);
});
