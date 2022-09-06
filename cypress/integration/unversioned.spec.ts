describe("Unversioned dataset", () => {
  it("should be possible to open a link to an unversioned dataset", () => {
    cy.visit(
      `/en/browse/dataset/https%3A%2F%2Fculture.ld.admin.ch%2Fsfa%2FStateAccounts_Function?dataSource=Int`
    );

    cy.waitForNetworkIdle(1000);
    cy.findByText("State accounts - Function");
  });
});
