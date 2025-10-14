import { describe, expect, it } from "vitest";

import { getHasColorMapping, sortFilterValues } from "@/configurator/components/filters";
import { HierarchyValue, TemporalDimension } from "@/domain/data";
import { TimeUnit } from "@/graphql/resolver-types";
import { getD3TimeFormatLocale } from "@/locales/locales";
import { getTimeFilterOptions } from "@/utils/time-filter-options";

describe("TimeFilter", () => {
  const dimension = {
    __typename: "TemporalDimension",
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    values: [{ value: "2020" }, { value: "ABC" }],
    relatedLimitValues: [],
  } as unknown as TemporalDimension;
  const formatLocale = getD3TimeFormatLocale("de");
  const timeFormatUnit = (date: Date | string, _: TimeUnit) => {
    return date.toString();
  };

  it("should correctly omit non-parsable dates", () => {
    const { sortedOptions, sortedValues } = getTimeFilterOptions({
      dimension,
      formatLocale,
      timeFormatUnit,
    });

    expect(sortedOptions).toHaveLength(1);
    expect(sortedValues).toHaveLength(1);
    expect(sortedOptions[0].value).toEqual("2020");
  });
});

describe("colorMapping", () => {
  it("should not detect colorMapping as present for single color fields", () => {
    expect(
      getHasColorMapping({
        colorConfig: { type: "single", paletteId: "321", color: "aliceblue" },
        filterDimensionId: "123",
      })
    ).toBe(false);
  });
});

describe("sortFilterValues", () => {
  it("should sort values numerically by identifier when identifiers are numeric strings", () => {
    const values: HierarchyValue[] = [
      {
        depth: 0,
        dimensionId: "test",
        value: "1",
        hasValue: true,
        label: "One",
        identifier: "1",
      },
      {
        depth: 0,
        dimensionId: "test",
        value: "10",
        hasValue: true,
        label: "Ten",
        identifier: "10",
      },
      {
        depth: 0,
        dimensionId: "test",
        value: "2",
        hasValue: true,
        label: "Two",
        identifier: "2",
      },
    ];

    const sortedValues = sortFilterValues(values);

    expect(sortedValues.map(v => v.identifier)).toEqual(["1", "2", "10"]);
  });
});
