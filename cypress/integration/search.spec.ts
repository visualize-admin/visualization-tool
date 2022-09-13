Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

describe("Searching for charts", () => {
  it("should be possible to edit filters of a hierarchy", () => {
    cy.visit(
      `/en/browse?includeDrafts=true&order=SCORE&search=category&dataSource=Int`
    );
    cy.waitForNetworkIdle(1000);

    cy.get("#datasetSearch").should("have.attr", "value", "category");
    cy.get("#dataset-include-drafts").should("have.attr", "checked");
  });
});
