Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

describe("Searching for charts", () => {
  it("should be possible to open a search URL, and search state should be recovered", () => {
    cy.visit(
      `/en/browse?includeDrafts=true&order=SCORE&search=category&dataSource=Int`
    );
    cy.waitForNetworkIdle(1000);

    cy.get("#datasetSearch").should("have.attr", "value", "category");
    cy.get("#dataset-include-drafts").should("have.attr", "checked");
  });
});
