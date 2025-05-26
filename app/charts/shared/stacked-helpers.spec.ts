import { NumberValue } from "d3-scale";
import { describe, expect, it } from "vitest";

import {
  getStackedTooltipValueFormatter,
  getStackedYScale,
} from "@/charts/shared/stacked-helpers";
import { Observation } from "@/domain/data";

const scalesData: Observation[] = [
  { x: "A", y: 1, segment: "Z" },
  { x: "B", y: 2, segment: "Z" },
  { x: "C", y: 3, segment: "Z" },
  { x: "A", y: 1, segment: "Y" },
  { x: "B", y: 1, segment: "Y" },
  { x: "C", y: 1, segment: "Y" },
];
const normalizedScalesData: Observation[] = [
  { x: "A", y: 50, segment: "Z" },
  { x: "B", y: (2 / 3) * 100, segment: "Z" },
  { x: "C", y: (3 / 4) * 100, segment: "Z" },
  { x: "A", y: 50, segment: "Y" },
  { x: "B", y: (1 / 3) * 100, segment: "Y" },
  { x: "C", y: (1 / 4) * 100, segment: "Y" },
];

const getX = (d: Observation) => d.x as string;
const getY = (d: Observation) => d.y as number;

describe("getStackedYScales", () => {
  it("should return correct domain", () => {
    const yScale = getStackedYScale(scalesData, {
      normalize: false,
      getX,
      getY,
    });

    expect(yScale.domain()).toEqual([0, 4]);
  });

  it("should start with 0 for single-value data", () => {
    const yScale = getStackedYScale(
      [
        {
          x: "A",
          y: 1500,
          segment: "Z",
        },
      ],
      {
        normalize: false,
        getX,
        getY,
      }
    );

    expect(yScale.domain()[0]).toEqual(0);
  });

  it("should return [0, 100] domain for normalized scale", () => {
    const normalizedYScale = getStackedYScale(scalesData, {
      normalize: true,
      getX,
      getY,
    });

    expect(normalizedYScale.domain()).toEqual([0, 100]);
  });

  it("should favor custom domain, but only if not in normalized mode", () => {
    const customYScale = getStackedYScale(scalesData, {
      normalize: false,
      getX,
      getY,
      customDomain: [-1, 1],
    });

    expect(customYScale.domain()).toEqual([-1, 1]);

    const normalizedCustomYScale = getStackedYScale(scalesData, {
      normalize: true,
      getX,
      getY,
      customDomain: [-1, 1],
    });

    expect(normalizedCustomYScale.domain()).toEqual([0, 100]);
  });
});

describe("getStackedTooltipValueFormatter", () => {
  const commonStackedTooltipFormatProps = {
    measureId: "y",
    measureUnit: "ABC",
    formatters: {},
    formatNumber: (d: NumberValue | null | undefined) => `${d}`,
  };

  it("should format stacked y values", () => {
    const format = getStackedTooltipValueFormatter({
      ...commonStackedTooltipFormatProps,
      normalize: false,
    });

    expect(format((scalesData[1] as any).y, null)).toEqual("2 ABC");
  });

  it("should format normalized stacked y values", () => {
    const normalizedFormat = getStackedTooltipValueFormatter({
      ...commonStackedTooltipFormatProps,
      normalize: true,
    });

    expect(
      normalizedFormat(
        normalizedScalesData[2].y as number,
        scalesData[2].y as number
      )
    ).toEqual("75% (3 ABC)");
  });
});
