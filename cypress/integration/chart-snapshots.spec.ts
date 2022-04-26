import intConfigs from "../../app/test/__fixtures/int/configs";

// Right now the CI app server runs connected to int.lindas.admin.ch
const configs = intConfigs.map((x) => ({ env: "int", ...x }));

describe("Chart Snapshots", () => {
  configs.forEach(({ slug, env }) => {
    it(`snapshot ${slug} matches`, () => {
      cy.on("uncaught:exception", (err, runnable) => {
        // return false to prevent the error from
        // failing this test
        return false;
      });

      cy.viewport("ipad-mini", "portrait");
      cy.visit(`/en/__test/${env}/${slug}`);
      cy.get(`[data-chart-loaded="true"]`, { timeout: 20000 });
      cy.wait(100);
      cy.document().toMatchImageSnapshot({
        capture: "fullPage",
        name: `chart-${env}-${slug}`,
      });
    });
  });
});
