describe("GraphQL API", () => {
  it("Does something", () => {
    expect(true).to.equal(true);
  });

  it("Matches test snapshot", () => {
    cy.wrap({ hello: "world" }).toMatchSnapshot();
  });
});
