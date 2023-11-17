import { TemporalDimension } from "@/domain/data";
import { TimeUnit } from "@/graphql/resolver-types";
import { getD3TimeFormatLocale } from "@/locales/locales";
import { RDFCubeViewQueryMock } from "@/test/cube-view-query-mock";

import { getTimeFilterOptions } from "./filters";

RDFCubeViewQueryMock;

describe("TimeFilter", () => {
  const dimension = {
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    values: [{ value: "2020" }, { value: "ABC" }],
  } as TemporalDimension;
  const formatLocale = getD3TimeFormatLocale("de");
  const timeFormatUnit = (date: Date | string, _: TimeUnit) => {
    return date.toString();
  };

  it("should correctly omit non-parseable dates", () => {
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
