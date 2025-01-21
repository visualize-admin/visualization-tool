import { Page } from "@playwright/test";

import { setup } from "./common";
import { Selectors } from "./selectors";

const { test } = setup();

type IframeDef = {
  elLocator: string;
  chartLocator: string;
};

const waitForIframe = async ({
  page,
  selectors,
  elLocator,
  chartLocator,
}: {
  page: Page;
  selectors: Selectors;
} & IframeDef) => {
  await page.waitForSelector(elLocator);
  const iframe = page.locator(elLocator);
  const contentFrame = iframe.contentFrame();
  await selectors.chart.loaded();
  await contentFrame.locator(chartLocator).first().waitFor({ timeout: 10_000 });
};

const iframeDefs: IframeDef[] = [
  {
    elLocator: "#chart-column",
    chartLocator: "svg",
  },
  {
    elLocator: "#chart-map",
    chartLocator: "canvas.maplibregl-canvas",
  },
];

test("should be possible to preview charts via API (iframe)", async ({
  page,
  selectors,
}) => {
  await page.goto("/en/_preview");
  await Promise.all(
    iframeDefs.map((def) => waitForIframe({ page, selectors, ...def }))
  );
});
