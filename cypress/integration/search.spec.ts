import selectors from "./selectors";

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

    selectors.search.searchInput(cy).should("have.attr", "value", "category");
    selectors.search.draftsCheckbox(cy).should("have.attr", "checked");
  });

  it("should have coherent numbers between the side panel and the filtered results", () => {
    cy.visit(`/en/browse`);
  });
});
