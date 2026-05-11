import { setup } from "./common";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

const { test, expect } = setup();

test("it updates per-locale table link base URLs and renders the correct href per locale", async ({
  actions,
  selectors,
  page,
  within,
  replayFromHAR,
}) => {
  await replayFromHAR();

  // Use "Red List" of species with "Species group" dimension, whose IRIs are
  // locale-invariant
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd003001/10",
    dataSource: "Prod",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });

  await selectors.edition.drawerLoaded();
  await actions.editor.changeRegularChartType("Table");
  await selectors.chart.loaded();

  // Expand "Links" section
  const linksSection = selectors.edition.controlSectionByTitle("Links");
  await linksSection.scrollIntoViewIfNeeded();
  await linksSection.locator("h6:text-is('Links')").click();

  // Enable links
  await (
    await within(linksSection).findByText("Enable links", undefined, {
      timeout: 5_000,
    })
  ).click();

  // Fill the per-locale base URL inputs
  for (const loc of ["de", "fr", "it", "en"] as const) {
    const input = page.locator(`input[name="links.baseUrl.${loc}"]`);
    await input.fill(`https://example.com/${loc}`);
    await input.blur();
  }

  // Set source column + target column to "Species group"
  await linksSection.locator('[id="links.componentId"]').click();
  await actions.mui.selectOption("Species group");

  await linksSection.locator('[id="links.targetComponentId"]').click();
  await actions.mui.selectOption("Species group");

  await selectors.chart.loaded();

  async function collectTableLinks() {
    const anchors = page.locator(
      'a[target="_parent"][href^="https://example.com/"]'
    );
    await anchors.first().waitFor({ timeout: 10_000 });
    return anchors.evaluateAll((els) =>
      (els as HTMLAnchorElement[]).map((a) => a.getAttribute("href") ?? "")
    );
  }

  // German links should use the german base URL
  await actions.common.switchLang("de");
  await selectors.chart.loaded();

  const germanLinks = await collectTableLinks();
  expect(germanLinks.length).toBeGreaterThan(0);
  for (const href of germanLinks) {
    // e.g. https://example.com/de/<species-group-iri-tail>
    expect(href).toMatch(/^https:\/\/example\.com\/de\/[^/]+$/);
  }

  // French links should use the french base URL
  await actions.common.switchLang("fr");
  await selectors.chart.loaded();

  const frenchLinks = await collectTableLinks();
  expect(frenchLinks.length).toBe(germanLinks.length);
  for (const href of frenchLinks) {
    expect(href).toMatch(/^https:\/\/example\.com\/fr\/[^/]+$/);
  }

  // The IRI tails (entity identifier) used in the URLs should stay the same
  // independent of the selected language
  expect(getIriTails(frenchLinks)).toEqual(getIriTails(germanLinks));
});

function getIriTails(urls: string[]) {
  return urls.map((h) => h.split("/").pop() ?? "").sort();
}
