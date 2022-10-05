import {
  loadChartInLocalStorage,
  waitForChartToBeLoaded,
} from "../charts-utils";
import testOrd507 from "../fixtures/test-ord-507-chart-config.json";

import selectors from "./selectors";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

beforeEach(() => {
  cy.viewport("macbook-15");
});

describe("viewing a dataset with only ordinal measures", () => {
  const key = "ePUgYyo622qS";
  const config = testOrd507;

  it("should retrieve dimension values properly", () => {
    cy.visit(
      `en/browse/dataset/${encodeURIComponent(config.dataSet)}?dataSource=Int`
    );

    cy.get("table", { timeout: 20000 })
      .findAllByRole("cell")
      .should("not.contain.text", "NaN");
  });

  it("should be possible to only select table chart", () => {
    loadChartInLocalStorage(key, config);
    cy.visit(`/en/create/${key}`);

    waitForChartToBeLoaded();
    cy.waitForNetworkIdle(1000);

    selectors.panels
      .chartTypeSelector(cy)
      .findAllByRole("button")
      .not(".Mui-disabled")
      .should("have.length", 1)
      .should("have.text", "Table");
  });
});
