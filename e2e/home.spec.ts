import { URL } from "url";

import { setup } from "./common";

const { test, describe, expect } = setup();

describe("The Home Page", () => {
  test("default language (de) should render on /", async ({ page }) => {
    await page.setExtraHTTPHeaders({
      "Accept-Language": "de",
    });

    await page.goto("/");
    await page
      .getByText("Visualisieren Sie Schweizer Open Government Data")
      .first()
      .waitFor();
    expect(await page.locator("html").getAttribute("lang")).toEqual("de");
  });

  test("Accept-Language header for alternative language (fr) should display French", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr",
    });

    await page.goto("/fr");
    await page
      .getByText("Visualisez les données ouvertes de l’administration publique suisse")
      .first()
      .waitFor();
    expect(await page.locator("html").getAttribute("lang")).toEqual("fr");
  });

  test("language switch should work", async ({ page, actions }) => {
    await page.goto("/");
    await actions.common.switchLang("fr");
    await page
      .getByText("Visualisez les données ouvertes de l’administration publique suisse")
      .first()
      .waitFor({ timeout: 20 * 1000 });

    expect(new URL(page.url()).pathname).toEqual("/fr");
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");
  });
});

describe("content pages", () => {
  test("language switch should work", async ({ page, actions }) => {
    await page.goto("/en/legal-framework");

    await actions.common.switchLang("fr");
    await page
      .getByText("Utilisation des jeux de données publiés sur visualize.admin.ch")
      .first()
      .waitFor({ timeout: 20 * 1000 });
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");
  });
});
