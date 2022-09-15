import { waitForChartToBeLoaded } from "../charts-utils";

import selectors from "./selectors";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

describe("Filters", () => {
  it("Initial state should have hierarchy dimensions first and topmost value selected", () => {
    cy.visit(
      `/en/create/new?cube=https://environment.ld.admin.ch/foen/nfi/49-19-None-None-44/cube/1&dataSource=Int`
    );
    waitForChartToBeLoaded();

    selectors.edition.findConfiguratorFilters(cy).within(() => {
      cy.findByText("1. production region");
      cy.findByText("2. stand structure");
      cy.findByText("3. evaluation type");
      cy.findByText("4. Inventory");
      cy.findByText("5. unit of evaluation");
    });

    selectors.edition
      .findChartFiltersList(cy)
      .should(
        "contain.text",
        "production region: Switzerland, stand structure: total, evaluation type: Zustand, Inventory: NFI1, unit of evaluation: accessible forest without shrub forest NFI1/NFI2/NFI3/NFI4"
      );
  });
});
