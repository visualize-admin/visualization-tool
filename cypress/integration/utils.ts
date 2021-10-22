export const ignoreUncaughtExceptions = (cy: Cypress.cy, rx: RegExp) => {
  cy.on("uncaught:exception", (err) => {
    console.log(err.message);
    /* returning false here prevents Cypress from failing the test */
    if (rx.test(err.message)) {
      return false;
    }
  });
};
