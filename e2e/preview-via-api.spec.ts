import { Page } from "@playwright/test";

import { setup } from "./common";

const { test } = setup();

type IframeDef = {
  elLocator: string;
  chartLocator: string;
};

const waitForIframe = async ({
  page,
  elLocator,
  chartLocator,
}: {
  page: Page;
} & IframeDef) => {
  await page.waitForSelector(elLocator);
  const iframe = page.locator(elLocator);
  const contentFrame = iframe.contentFrame();
  await contentFrame
    .locator('[data-chart-loaded="true"]')
    .waitFor({ timeout: 30_000 });
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
}) => {
  await page.goto("/en/_preview");
  await Promise.all(iframeDefs.map((def) => waitForIframe({ page, ...def })));
});
