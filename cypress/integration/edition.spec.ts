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
  cy.viewport("macbook-15");
});

describe("Editing a chart", () => {
  it("should be possible to edit filters of a hierarchy", () => {
    const key = "WtHYbmsehQKo";
    const config = offentlicheAusgabenChartConfigFixture;
    loadChartInLocalStorage(key, config);
    cy.visit(`/en/create/${key}`);
    waitForChartToBeLoaded();

    cy.waitForNetworkIdle(1000);

    cy.findByText("Select none", { timeout: 10 * 1000 }).click();
    cy.findByText("Filters", {
      selector: "button",
    }).click();
    cy.findByText("Military defence").click();
    cy.findByText("Civil defence").click();
    cy.findByText("Mining, manufacturing and construction").click();
    cy.findByText("Transport").click();
    cy.findByText("Communication").click();
    cy.findByText("Apply filters").click();

    cy.get('[data-name="panel-middle"]').scrollTo(0, 200, {
      ensureScrollable: false,
    });
    cy.waitForNetworkIdle(1000);
    waitForChartToBeLoaded();
    cy.screenshot(`chart-edition-${key}`);
  });
});
