import configIds from "../fixtures/dev/config-keys.json";

describe("Chart Snapshots", () => {
  configIds.forEach((id: string) => {
    it(`snapshot ${id} matches`, () => {
      cy.on("uncaught:exception", (err, runnable) => {
        // return false to prevent the error from
        // failing this test
        return false;
      });

      cy.viewport("ipad-mini", "portrait");
      cy.visit(`/en/__test/${id}`);
      cy.get(`[data-chart-loaded="true"]`, { timeout: 10000 });

      cy.document().toMatchImageSnapshot({ name: `snapshot-${id}` });
    });
  });
});
