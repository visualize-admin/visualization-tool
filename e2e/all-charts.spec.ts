import {
  BASELINE_SUFFIX,
  SCREENSHOTS_FOLDER,
  TO_COMPARE_SUFFIX,
} from "../scripts/compare-screenshots-utils";

import { setup, sleep } from "./common";

const { test } = setup();

// This is a special test that will take a screenshot of every chart in the
// PROD database (up to 1000 charts) and save it to the screenshots folder.

// To run this test, remove the .skip from the test function below and checkout
// to the baseline branch. Afterwards, run `yarn run e2e:dev e2e/all-charts.spec.ts --headed`
// to generate the baseline screenshots.

// After the baseline screenshots have been generated, checkout to the comparison
// branch and run `yarn run e2e:dev e2e/all-charts.spec.ts --headed` to generate the
// comparison screenshots. Make sure to change the IS_BASELINE variable to false.

// After the comparison screenshots have been generated, run `yarn compare-screenshots`
// to compare the screenshots.
const IS_BASELINE = true;

test.skip("all charts", async ({ page }) => {
  await page.goto(`/en/preview`);

  const configs = await fetch(
    "https://visualize.admin.ch/api/config/all?limit=1000"
  ).then(async (res) => {
    const json = await res.json();
    return json.data;
  });

  let i = 0;
  for (const config of configs) {
    if (i > 0) {
      await page.reload();
    }

    console.log(`Rendering chart ${i + 1} / ${configs.length}`);

    try {
      await page.evaluate((config) => {
        window.postMessage(config.data, "*");
      }, config);
      await page.waitForLoadState("networkidle");
    } catch (e) {
      console.error("Failed to load chart", e);
      return;
    } finally {
      i++;
    }

    await sleep(2_000);

    await page.screenshot({
      path: `${SCREENSHOTS_FOLDER}/${config.key}${
        IS_BASELINE ? BASELINE_SUFFIX : TO_COMPARE_SUFFIX
      }.png`,
      fullPage: true,
    });

    const errorDialogCloseButton = await page.$(
      "[data-nextjs-errors-dialog-left-right-close-button='true']"
    );

    if (errorDialogCloseButton) {
      await errorDialogCloseButton.click();
      await sleep(1_000);
      const errorToastCloseButton = await page.$(
        "[data-nextjs-toast-errors-hide-button='true']"
      );

      if (errorToastCloseButton) {
        await errorToastCloseButton.click();
        await sleep(1_000);
      }
    }
  }
});
