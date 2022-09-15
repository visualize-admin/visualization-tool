type Cy = Cypress.Chainable;

const selectors = {
  search: {
    findSearchInput: (cy: Cy) => cy.get("#datasetSearch"),
    findIncludeDraftsCheckbox: (cy: Cy) => cy.get("#dataset-include-drafts"),
  },
  edition: {
    findLeftPanel: (cy: Cy) => cy.get('[data-name="panel-left"]'),
    findRightPanel: (cy: Cy) => cy.get('[data-name="panel-right"]'),
    findConfiguratorFilters: (cy: Cy) =>
      cy.findByTestId("configurator-filters"),
    findChartFiltersList: (cy: Cy) => cy.findByTestId("chart-filters-list"),
  },
};

export default selectors;
