import { URL } from "url";

import { describe, it, expect } from "./common";

describe("The Home Page", () => {
  it("default language (de) should render on /", async ({ page, screen }) => {
    await page.setExtraHTTPHeaders({
      "Accept-Language": "de",
    });

    await page.goto("/");
    await screen.findByText("Visualisieren Sie Schweizer Open Government Data");
    expect(await page.locator("html").getAttribute("lang")).toEqual("de");
  });

  it("Accept-Language header for alternative language (fr) should display French", async ({
    page,
    screen,
  }) => {
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr",
    });

    await page.goto("/fr");
    await screen.findByText(
      "Visualisez les données ouvertes de l’administration publique suisse"
    );
    expect(await page.locator("html").getAttribute("lang")).toEqual("fr");
  });

  it("language switch should work", async ({ page, screen }) => {
    await page.goto("/");
    await page.locator('a[hreflang="fr"]').click();
    await screen.findByText(
      "Visualisez les données ouvertes de l’administration publique suisse",
      undefined,
      { timeout: 20 * 1000 }
    );

    expect(new URL(page.url()).pathname).toEqual("/fr");
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");
  });
});
