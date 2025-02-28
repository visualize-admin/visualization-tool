import { Page } from "@playwright/test";

import { setup, sleep } from "./common";

const { test, expect } = setup();

const clearColorPalettes = async (page: Page) => {
  while (true) {
    const deleteButtonCount = await page
      .locator('[data-testid="profile-delete-color-palette"]')
      .count();

    if (deleteButtonCount === 0) {
      break;
    }

    await page
      .locator('[data-testid="profile-delete-color-palette"]')
      .first()
      .click();

    await page.waitForTimeout(500);
  }
};

const addNewColor = async (page: Page, i: number) => {
  await page.locator('[data-testid="profile-add-new-color"]').click();

  await page.getByRole("button", { name: "Open Color Picker" }).last().click();
  await sleep(1_000);

  const saturation = page.locator('[data-testid="color-picker-saturation"]');
  await saturation.waitFor({ state: "visible", timeout: 5000 });

  const box = await saturation.boundingBox();
  if (!box) {
    throw new Error("Could not get saturation element bounding box");
  }

  const randomX = box.x + Math.random() * box.width;
  const randomY = box.y + Math.random() * box.height;

  await page.mouse.click(randomX, randomY);
  await sleep(1_000);
  await page.keyboard.press("Escape");
};

test("Custom color palettes on profile page should allow CREATE, UPDATE and DELETING palettes ", async ({
  page,
  auth,
}) => {
  test.slow();

  await page.goto("/en");
  await auth();
  await page.waitForLoadState("networkidle");
  await page.goto("/en/profile");
  const url = page.url();
  expect(url.endsWith("/en/profile")).toBe(true);
  const tab = page.locator('[data-testid="color-palettes-tab"]');
  await tab.waitFor({ state: "visible", timeout: 5000 });
  await tab.click();

  await page.waitForLoadState("networkidle");
  await clearColorPalettes(page);

  //Create Categorical Palette
  await page.locator('[data-testid="add-profile-color-palette"]').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  const categoricalTitleInput = page.locator(
    'input[name="custom-color-palette-title"]'
  );
  await categoricalTitleInput.waitFor({ state: "visible", timeout: 5000 });
  await categoricalTitleInput.click();
  await categoricalTitleInput.fill("Categorical Palette");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  for (let i = 0; i < 3; i++) {
    await addNewColor(page, i);
  }
  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await page.waitForLoadState("networkidle");
  await sleep(1_000);

  const categoricalTitleExists = await page
    .getByText("Categorical Palette")
    .isVisible();
  expect(categoricalTitleExists).toBe(true);

  //Create Sequential Palette
  await page.locator('[data-testid="add-profile-color-palette"]').click();
  await page
    .locator('[data-testid="profile-color-palette-sequential"]')
    .click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState("networkidle");
  await sleep(1_000);

  const sequentialTitleInput = page.locator(
    'input[name="custom-color-palette-title"]'
  );
  await sequentialTitleInput.waitFor({ state: "visible", timeout: 5000 });
  await sequentialTitleInput.click();
  await sequentialTitleInput.fill("Sequential Palette");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await sleep(1_000);

  const sequentialTitleExists = await page
    .getByText("Sequential Palette")
    .isVisible();
  expect(sequentialTitleExists).toBe(true);

  //Create Diverging Palette (2 colors)
  await page.locator('[data-testid="add-profile-color-palette"]').click();
  await page.locator('[data-testid="profile-color-palette-diverging"]').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  const divergingTwoTitleInput = page.locator(
    'input[name="custom-color-palette-title"]'
  );
  await divergingTwoTitleInput.waitFor({ state: "visible", timeout: 5000 });
  await divergingTwoTitleInput.click();
  await divergingTwoTitleInput.fill("Diverging Palette (2)");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: "Remove Color" }).first().click();
  await sleep(1_000);

  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await page.waitForLoadState("networkidle");
  await sleep(1_000);

  const divergingTwoTitleExists = await page
    .getByText("Diverging Palette (2)")
    .isVisible();
  expect(divergingTwoTitleExists).toBe(true);

  //Create Diverging Palette (3 colors)
  await page.locator('[data-testid="add-profile-color-palette"]').click();
  await page.locator('[data-testid="profile-color-palette-diverging"]').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  const divergingThreeTitleInput = page.locator(
    'input[name="custom-color-palette-title"]'
  );
  await divergingThreeTitleInput.waitFor({ state: "visible", timeout: 5000 });
  await divergingThreeTitleInput.click();
  await divergingThreeTitleInput.fill("Diverging Palette (3)");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await page.waitForLoadState("networkidle");
  await sleep(1_000);

  const divergingThreeTitleExists = await page
    .getByText("Diverging Palette (3)")
    .isVisible();
  expect(divergingThreeTitleExists).toBe(true);

  //Update Color palettes
  //Edit Categorical Palette add more colors
  await page
    .getByRole("button", { name: "login.profile.my-color-palettes.edit" })
    .first()
    .click();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  for (let i = 0; i < 3; i++) {
    await addNewColor(page, i);
  }
  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await sleep(1_000);

  //Edit Sequential Palette change type
  await page
    .getByRole("button", { name: "login.profile.my-color-palettes.edit" })
    .first()
    .click();
  await page
    .locator('[data-testid="profile-color-palette-categorical"]')
    .click();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  for (let i = 0; i < 3; i++) {
    await addNewColor(page, i);
  }
  await page.locator('[data-testid="profile-save-color-palette"]').click();
  await sleep(1_000);

  //Delete Color palettes
  const paletteNames = [
    "Categorical Palette",
    "Sequential Palette",
    "Diverging Palette (2)",
    "Diverging Palette (3)",
  ];

  for (const paletteName of paletteNames) {
    const allRows = page.locator('[data-testid="profile-color-palette-row"]');
    const count = await allRows.count();

    for (let i = 0; i < count; i++) {
      const row = allRows.nth(i);

      const titleElement = row.locator(
        '[data-testid="custom-color-palette-title"]'
      );
      const titleText = await titleElement.textContent();

      if (titleText && titleText.trim() === paletteName.trim()) {
        await row
          .locator('[data-testid="profile-delete-color-palette"]')
          .click();

        await page.waitForTimeout(300);
        break;
      }
    }
  }
});
