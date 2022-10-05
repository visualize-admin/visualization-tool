type Cy = Cypress.Chainable;

const selectors = {
  search: {
    searchInput: (cy: Cy) => cy.get("#datasetSearch"),
    draftsCheckbox: (cy: Cy) => cy.get("#dataset-include-drafts"),
  },
  panels: {
    left: (cy: Cy) => cy.get('[data-name="panel-left"]'),
    right: (cy: Cy) => cy.get('[data-name="panel-right"]'),
    chartTypeSelector: (cy: Cy) => cy.findByTestId("chart-type-selector"),
  },
  edition: {
    configFilters: (cy: Cy) => cy.findByTestId("configurator-filters"),
    chartFilters: (cy: Cy) => cy.findByTestId("chart-filters-list"),
  },
};

export default selectors;
