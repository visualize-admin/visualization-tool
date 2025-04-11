import { TemporalDimension } from "@/domain/data";
import { TimeUnit } from "@/graphql/resolver-types";
import { getD3TimeFormatLocale } from "@/locales/locales";
import { getTimeFilterOptions } from "@/utils/time-filter-options";

describe("getTimeFilterOptions", () => {
  const dimension = {
    __typename: "TemporalDimension",
    timeFormat: "%Y-%m-%dT%H:%M:%S",
    timeUnit: TimeUnit.Second,
    values: [
      {
        value: "2025-01-10T00:00:00+01:00",
        label: "2025-01-10T00:00:00+01:00",
      },
      {
        value: "2025-01-11T00:00:00+01:00",
        label: "2025-01-11T00:00:00+01:00",
      },
      {
        value: "2025-01-12T00:00:00+01:00",
        label: "2025-01-12T00:00:00+01:00",
      },
    ],
    relatedLimitValues: [],
  } as unknown as TemporalDimension;
  const formatLocale = getD3TimeFormatLocale("de");
  const timeFormatUnit = jest.fn();

  it("should correctly parse dates with timezone", () => {
    const { sortedOptions } = getTimeFilterOptions({
      dimension,
      formatLocale,
      timeFormatUnit,
    });
    expect(sortedOptions).toHaveLength(3);
  });
});
