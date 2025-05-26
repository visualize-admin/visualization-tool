import { describe, expect, it } from "vitest";

import {
  imputeTemporalLinearSeries,
  interpolateTemporalLinearValue,
  interpolateZerosValue,
} from "@/charts/shared/imputation";

describe("imputation", () => {
  const previousValue = 10;
  const nextValue = 20;

  const previousDate = new Date(2020, 0, 0);
  const currentDate = new Date(2020, 5, 11);
  const nextDate = new Date(2021, 0, 0);

  const expectedLinearlyInterpolatedValue =
    previousValue +
    ((nextValue - previousValue) *
      (currentDate.getTime() - previousDate.getTime())) /
      (nextDate.getTime() - previousDate.getTime());

  it("should return zero", () => {
    expect(interpolateZerosValue()).toEqual(0);
  });

  it("should return linearly interpolated value", () => {
    const interpolatedValue = interpolateTemporalLinearValue({
      previousValue,
      nextValue,
      previousTime: previousDate.getTime(),
      currentTime: currentDate.getTime(),
      nextTime: nextDate.getTime(),
    });

    expect(Math.round(interpolatedValue * 1e5) / 1e5).toEqual(
      Math.round(expectedLinearlyInterpolatedValue * 1e5) / 1e5
    );
  });

  it("should impute linearly interpolated value and leave present values intact", () => {
    const dataToImpute = [
      { date: previousDate, value: previousValue },
      { date: currentDate, value: null },
      { date: nextDate, value: nextValue },
    ];

    imputeTemporalLinearSeries({
      dataSortedByX: dataToImpute,
    });

    expect(Math.round(dataToImpute[1].value! * 1e5) / 1e5).toEqual(
      Math.round(expectedLinearlyInterpolatedValue * 1e5) / 1e5
    );
    expect(dataToImpute[0].value).toEqual(previousValue);
    expect(dataToImpute[2].value).toEqual(nextValue);
  });
});
