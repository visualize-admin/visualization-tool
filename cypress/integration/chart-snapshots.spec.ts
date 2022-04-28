import intConfigs from "../../app/test/__fixtures/int/configs";
import "cypress-network-idle";

// Right now the CI app server runs connected to int.lindas.admin.ch
const configs = intConfigs.map((x) => ({ env: "int", ...x }));

describe("Chart Snapshots", () => {
  it(`screenshots`, () => {
    for (const viewportArgs of [
      ["ipad-mini", "portrait"],
      ["iphone-8", "portrait"],
    ] as [Cypress.ViewportPreset, Cypress.ViewportOrientation][]) {
      configs.forEach(({ slug, env }) => {
        cy.on("uncaught:exception", (err, runnable) => {
          console.log(err);
          // return false to prevent the error from
          // failing tests
          return false;
        });
        cy.viewport(...viewportArgs);
        cy.visit(`/en/__test/${env}/${slug}`);
        cy.get(`[data-chart-loaded="true"]`, { timeout: 20000 });
        cy.wait(100);

        if (slug.includes("map")) {
          // @ts-ignore
          cy.waitForNetworkIdle(1000);
        }
        // Screenshots are not compared by Cypress, they are uploaded to argos
        cy.screenshot(`chart-${env}-${viewportArgs[0]}-${slug}`, {
          capture: "fullPage",
        });
        cy.wait(100);
      });
    }
  });
});
