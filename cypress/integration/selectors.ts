type Cy = Cypress.Chainable;

const selectors = {
  search: {
    findSearchInput: (cy: Cy) => cy.get("#datasetSearch"),
    findIncludeDraftsCheckbox: (cy: Cy) => cy.get("#dataset-include-drafts"),
  },
  edition: {
    findConfiguratorFilters: (cy: Cy) =>
      cy.findByTestId("configurator-filters"),
    findChartFiltersList: (cy: Cy) => cy.findByTestId("chart-filters-list"),
  },
};

export default selectors;
