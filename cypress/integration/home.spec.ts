describe("The Home Page", () => {
  it("default language (de) should render on /", () => {
    cy.request({
      url: "/",
      followRedirect: false,
      headers: { "Accept-Language": "de" },
    }).should((response) => {
      expect(response.status).to.equal(200);
    });
  });

  it("Accept-Language header for alternative language (fr) should redirect to /fr", () => {
    cy.request({
      url: "/",
      followRedirect: false,
      headers: { "Accept-Language": "fr" },
    }).should((response) => {
      expect(response.status).to.equal(307);
      expect(response.headers.location).to.equal("/fr");
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
