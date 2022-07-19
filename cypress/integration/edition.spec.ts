import {
  loadChartInLocalStorage,
  waitForChartToBeLoaded,
} from "../charts-utils";
import offentlicheAusgabenChartConfigFixture from "../fixtures/offentliche-ausgaben-chart-config.json";

const resizeObserverLoopErrRe = /> ResizeObserver loop/;
Cypress.on("uncaught:exception", (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

beforeEach(() => {
  cy.viewport("macbook-13");
});

describe("Editing a chart", () => {
  it("should be possible to edit filters of a hierarchy", () => {
    const key = "WtHYbmsehQKo";
    const config = offentlicheAusgabenChartConfigFixture;
    loadChartInLocalStorage(key, config);
    cy.visit(`/en/create/${key}`);
    waitForChartToBeLoaded();
    cy.findByTestId(`selection-controls-tree-filters`, {
      timeout: 20000,
    });
    cy.findByTestId("chart-edition-right-filters").scrollIntoView();
    cy.findByText("Select none").click();
    cy.findByText("General public services").click();
    cy.findByText("Basic research").click();
    cy.waitForNetworkIdle(1000);
    waitForChartToBeLoaded();
    cy.screenshot(`chart-edition-${key}`);
  });
});
