import { loadFixtureConfigIdsSync } from "./utils";

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot(opts: {}): R;
    }
  }
}

const RENDER_DELAY = 10;
const SNAPSHOT_OPTS = {
  failureThreshold: 10,
  failureThresholdType: "pixel",
  customSnapshotIdentifier: ({ currentTestName, counter }: $IntentionalAny) =>
    `${currentTestName}`
};

const configIds = loadFixtureConfigIdsSync();

test.each(configIds)("chart-%s", async id => {
  await page.goto("http://localhost:3000/en/__test/" + id, {
    waitUntil: "networkidle2"
  });
  await page.waitFor(RENDER_DELAY);
  const image = await page.screenshot();
  expect(image).toMatchImageSnapshot(SNAPSHOT_OPTS);
});
