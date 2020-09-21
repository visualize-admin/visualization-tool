describe("The Home Page", () => {
  it("should redirect to /de", () => {
    cy.request({ url: "/", followRedirect: false }).should((response) => {
      expect(response.status).to.equal(307);
      expect(response.headers.location).to.equal("/de");
    });
  });

  it("successfully loads", () => {
    cy.visit("/");
  });

  it("html lang should be 'de'", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "lang", "de");
  });

  it("language switch should work", () => {
    cy.visit("/");

    cy.get('a[hreflang="fr"]').click();

    cy.location("pathname").should("equal", "/fr");

    cy.get("html").should("have.attr", "lang", "fr");
  });
});
