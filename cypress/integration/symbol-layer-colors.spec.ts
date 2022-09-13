import {
  loadChartInLocalStorage,
  waitForChartToBeLoaded,
} from "../charts-utils";
import mapWaldflascheChartConfigFixture from "../fixtures/map-waldflasche-chart-config.json";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

beforeEach(() => {
  cy.viewport("macbook-15");
});

describe("Selecting SymbolLayer colors", () => {
  it("should be possible to select nominal dimension and see a legend", () => {
    const key = "jky5IEw6poT3";
    const config = mapWaldflascheChartConfigFixture;
    loadChartInLocalStorage(key, config);
    cy.visit(`/en/create/${key}`);
    waitForChartToBeLoaded();

    cy.waitForNetworkIdle(1000);

    cy.findByText("Symbols", { timeout: 15000 }).click();
    cy.findByText("Show layer").click();
    cy.findByText("None").click();

    cy.get(
      '[data-value="https://environment.ld.admin.ch/foen/nfi/inventory"]'
    ).click();

    cy.get('[data-testid="colorLegend"]')
      .find("div")
      .its("length")
      .should("eq", 4);
  });
});
