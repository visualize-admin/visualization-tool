import { setup } from "./common";

const { test, expect } = setup();

test("makeStyles overrides load after emotion styles", async ({ page }) => {
  await page.goto("/en");
  await page.locator("footer").waitFor();

  const emotionStylesAfterJss = await page.evaluate(() => {
    const firstJssStyle = document.head.querySelector("style[data-jss]");

    if (!firstJssStyle) {
      return [];
    }

    return [...document.head.querySelectorAll("style[data-emotion]")]
      .filter(
        (style) =>
          firstJssStyle.compareDocumentPosition(style) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
      .map((style) => style.getAttribute("data-emotion"));
  });

  expect(emotionStylesAfterJss).toEqual([]);
});
