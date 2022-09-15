import { ignoreUncaughtExceptions } from "./utils";

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("> ResizeObserver loop")) {
    return false;
  }
});

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
    // TODO At some point we should be able to understand what causes ResizeObserver
    // errors when we change the language. This does not cause a problem to the user
    // as the site continues to be functional.
    // @see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
    ignoreUncaughtExceptions(cy, /ResizeObserver/);

    cy.visit("/");

    cy.get('a[hreflang="fr"]').click();

    // Examples data can take a long time to arrive
    cy.get(`html[lang="fr"]`, { timeout: 20000 });

    cy.location("pathname").should("equal", "/fr");

    cy.get("html").should("have.attr", "lang", "fr");
  });
});
