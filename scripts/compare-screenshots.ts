import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";

// @ts-ignore
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  BASELINE_SUFFIX,
  SCREENSHOTS_FOLDER,
  TO_COMPARE_SUFFIX,
} from "./compare-screenshots-utils";

const compareScreenshots = async () => {
  const files = readdirSync(SCREENSHOTS_FOLDER);
  const uniqueChartConfigKeys = Array.from(
    new Set(
      files.map((file) =>
        file
          .replace(BASELINE_SUFFIX, "")
          .replace(TO_COMPARE_SUFFIX, "")
          .replace(".png", "")
      )
    )
  );
  const relevantChartConfigKeys = uniqueChartConfigKeys.filter(
    (key) =>
      existsSync(`${SCREENSHOTS_FOLDER}/${key}${BASELINE_SUFFIX}.png`) &&
      existsSync(`${SCREENSHOTS_FOLDER}/${key}${TO_COMPARE_SUFFIX}.png`)
  );

  for (const key of relevantChartConfigKeys) {
    const baselinePath = `${SCREENSHOTS_FOLDER}/${key}-baseline.png`;
    const toComparePath = `${SCREENSHOTS_FOLDER}/${key}-to-compare.png`;

    const baselineImage = PNG.sync.read(readFileSync(baselinePath));
    const toCompareImage = PNG.sync.read(readFileSync(toComparePath));

    const { width, height } = baselineImage;

    const widthDiff = Math.abs(width - toCompareImage.width);
    const heightDiff = Math.abs(height - toCompareImage.height);

    if (widthDiff || heightDiff) {
      console.error(
        `🔎 (w: ${widthDiff}px, h: ${heightDiff}px) | ${SCREENSHOTS_FOLDER}/${key}-baseline.png | ${SCREENSHOTS_FOLDER}/${key}-to-compare.png`
      );
      continue;
    }

    const diff = new PNG({ width, height });

    const diffPixels = pixelmatch(
      baselineImage.data,
      toCompareImage.data,
      diff.data,
      width,
      height,
      { threshold: 0.5 }
    );

    if (diffPixels > 4) {
      console.error(
        `❌ (p: ${diffPixels}px) | ${SCREENSHOTS_FOLDER}/${key}-diff.png`
      );
      writeFileSync(
        `${SCREENSHOTS_FOLDER}/${key}-diff.png`,
        PNG.sync.write(diff)
      );
    } else {
      console.log(`✅ ${key}`);
    }
  }
};

compareScreenshots();
