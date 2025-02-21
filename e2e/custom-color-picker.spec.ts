import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import offentlicheAusgabenChartConfigFixture from "./fixtures/offentliche-ausgaben-chart-config.json";

const { test, expect } = setup();

test("Custom Color Picker", async ({ page, selectors }) => {
  const key = "WtHYbmsehQKo";
  const config = offentlicheAusgabenChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1_000);

  await page.getByRole("button", { name: "Open Color Picker" }).first().click();
  await sleep(1_000);

  const colorSquare = page.getByTestId("color-square").first();
  await colorSquare.waitFor({ state: "visible", timeout: 5000 });
  const initialColor = await colorSquare.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );

  const saturation = page.locator('[data-testid="color-picker-saturation"]');
  await saturation.waitFor({ state: "visible", timeout: 5000 });

  await saturation.click();
  await sleep(1_000);

  const newColor = await colorSquare.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );
  expect(newColor).not.toBe(initialColor);

  const input = page.locator('input[name="color-picker-input"]');
  await input.waitFor({ state: "visible", timeout: 5000 });
  await input.click();
  await input.fill("#FF0000");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  const finalColor = await colorSquare.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );

  expect(finalColor).toBe("rgb(255, 0, 0)");

  const hue = page.locator('[data-testid="color-picker-hue"]');
  await hue.waitFor({ state: "visible", timeout: 5000 });

  await hue.click();
  await sleep(1_000);

  const selectedHueColor = await colorSquare.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );

  expect(selectedHueColor).toBe("rgb(0, 255, 248)");

  //FIXME: figure out a way to test the color picker pen tool in this env
  // const picker = page.locator('[data-testid="color-picker-chrome"]');
  // await picker.waitFor({ state: "visible", timeout: 5000 });

  // await picker.click();
  // await sleep(1_000);
  // await page.mouse.click(300, 300)

  // const selectedColor = await colorSquare.evaluate(
  //   (el) => window.getComputedStyle(el).backgroundColor
  // );

  // expect(selectedColor).toBe("rgb(255, 255, 255)");
});
