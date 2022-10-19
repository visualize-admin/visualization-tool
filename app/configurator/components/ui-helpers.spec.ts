import { renderHook } from "@testing-library/react-hooks";

import { DimensionMetadataFragment, TimeUnit } from "../../graphql/query-hooks";

import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
  useDimensionFormatters,
  useFormatFullDateAuto,
  useTimeFormatLocale,
} from "./ui-helpers";

describe("useFormatFullDateAuto", () => {
  const setup = () => {
    const {
      result: { current: formatFullDateAuto },
    } = renderHook(() => useFormatFullDateAuto());
    return { formatFullDateAuto };
  };

  it("should work with normal dates", () => {
    const { formatFullDateAuto } = setup();
    expect(formatFullDateAuto("2021-05-02T19:43")).toEqual("02.05.2021 19:43");
  });

  it("should work with null dates", () => {
    const { formatFullDateAuto } = setup();
    expect(formatFullDateAuto(null)).toEqual("-");
  });
});

describe("useDimensionFormatters", () => {
  const setup = () => {
    const {
      result: { current: formatters },
    } = renderHook(() =>
      useDimensionFormatters([
        {
          iri: "iri-monthly",
          timeFormat: "%Y-%m",
          timeUnit: TimeUnit.Month,
          isNumerical: false,
          isKeyDimension: false,
          __typename: "TemporalDimension",
        } as DimensionMetadataFragment,
        {
          iri: "iri-yearly",
          timeFormat: "%Y",
          timeUnit: TimeUnit.Year,
          isNumerical: false,
          isKeyDimension: false,
          __typename: "TemporalDimension",
        } as DimensionMetadataFragment,
        {
          iri: "iri-number",
          isNumerical: true,
          isKeyDimension: false,
        } as DimensionMetadataFragment,
        {
          iri: "iri-currency",
          isNumerical: true,
          isKeyDimension: false,
          isCurrency: true,
          currencyExponent: 1,
          __typename: "NumericalMeasure",
        } as DimensionMetadataFragment,
        {
          iri: "iri-currency-int",
          isNumerical: true,
          isKeyDimension: false,
          isCurrency: true,
          currencyExponent: 1,
          resolution: 0,
          __typename: "NumericalMeasure",
        } as DimensionMetadataFragment,
      ])
    );
    return { formatters };
  };

  it("should work with monthly dates", () => {
    const { formatters } = setup();
    expect(formatters["iri-monthly"]("2021-05")).toEqual("05.2021");
  });

  it("should work with yearly dates", () => {
    const { formatters } = setup();
    expect(formatters["iri-yearly"]("2021")).toEqual("2021");
  });

  it("should work with numbers", () => {
    const { formatters } = setup();
    expect(formatters["iri-number"]("2.33333")).toEqual("2,33");
  });

  it("should work with currencies", () => {
    const { formatters } = setup();

    // Keeps precision if it is over the currencyExponent
    expect(formatters["iri-currency"]("20002.3333")).toEqual("20'002,3333");

    // Pads with 0 otherwise
    expect(formatters["iri-currency"]("20002")).toEqual("20'002,0");
  });

  it("should work with dimension marked with currency and with datatype integer", () => {
    const { formatters } = setup();

    // If we have a resolution on the dimension
    expect(formatters["iri-currency-int"]("20002")).toEqual("20'002");
  });
});

describe("time intervals", () => {
  const setup = () => {
    const {
      result: { current: timeFormatLocale },
    } = renderHook(() => useTimeFormatLocale());
    const timeIntervalWithProps = getTimeIntervalWithProps(
      "2021-05-10",
      "2021-05-15",
      TimeUnit.Day,
      "%Y-%m-%d",
      timeFormatLocale
    );
    return { timeIntervalWithProps };
  };

  it("should match values to time interval select options", () => {
    const { timeIntervalWithProps } = setup();
    const timeIntervalFormattedSelectOptions =
      getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);

    expect(timeIntervalFormattedSelectOptions).toEqual([
      { value: "2021-05-10", label: "2021-05-10" },
      { value: "2021-05-11", label: "2021-05-11" },
      { value: "2021-05-12", label: "2021-05-12" },
      { value: "2021-05-13", label: "2021-05-13" },
      { value: "2021-05-14", label: "2021-05-14" },
      { value: "2021-05-15", label: "2021-05-15" },
    ]);
  });
});
