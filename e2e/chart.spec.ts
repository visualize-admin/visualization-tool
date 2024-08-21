// testAndSaveHar; `browsing-test.har`,

import { testAndSaveHar } from "../k6/scenario-tests/utils";

testAndSaveHar(
  "Browsing test @har @noci",
  "browsng-test.har",
  async ({ page }) => {
    await page.goto("https://visualize.admin.ch/v/hp0dOWAf-jSp");
    await page.getByRole("button", { name: "Filter anzeigen" }).click();
    await page.getByLabel("Standardprodukt").nth(1).click();
    await page.getByRole("option", { name: "C5" }).click();
    await page.getByLabel("Standardprodukt").nth(1).click();
    await page.getByRole("option", { name: "H8" }).click();
    await page.getByLabel("Standardprodukt").nth(1).click();
    await page.getByRole("option", { name: "H5" }).click();
    await page.getByLabel("Standardprodukt").nth(1).click();
    await page.getByRole("option", { name: "C3" }).click();
    await page.getByLabel("Standardprodukt").nth(1).click();
    await page.getByRole("option", { name: "C2" }).click();
  }
);
