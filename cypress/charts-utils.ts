export const loadChartInLocalStorage = (chartKey: string, config: any) => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      `vizualize-configurator-state:${chartKey}`,
      JSON.stringify(config)
    );
  });
};

export const waitForChartToBeLoaded = () => {
  cy.get(`[data-chart-loaded="true"]`, { timeout: 20000 });
};
