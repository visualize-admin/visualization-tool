import { beforeEach, describe, expect, it } from "vitest";

import { Timeline } from "./observables";

describe("Timeline", () => {
  const values = [1, 100, 200, 500, 750, 1000];
  const [min, max] = [values[0], values[values.length - 1]];
  const formatValue = (d: number) => `${d}ms`;
  const timeline = new Timeline({
    type: "interval",
    animationType: "continuous",
    msDuration: 1000,
    msValues: values,
    formatValue,
  });

  beforeEach(() => timeline.setProgress(0));

  it("should set values", () => {
    expect(timeline.value).toEqual(1);

    timeline.setProgress(0.25);
    expect(timeline.value).toEqual(200);

    timeline.setProgress(0.5);
    expect(timeline.value).toEqual(500);

    timeline.setProgress(0.8);
    expect(timeline.value).toEqual(750);

    timeline.setProgress(1);
    expect(timeline.value).toEqual(1000);
  });

  it("should animate", async () => {
    timeline.start();
    expect(timeline.playing).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    timeline.stop();
    expect(timeline.playing).toBe(false);
    expect(timeline.progress).toBeGreaterThan(0);
  });

  it("should set domain", () => {
    expect(timeline.domain).toEqual(values.map((d) => (d - min) / (max - min)));
  });

  it("should set formatted extent", () => {
    expect(timeline.formattedExtent).toEqual([
      formatValue(min),
      formatValue(max),
    ]);
  });
});
