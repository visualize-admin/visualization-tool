import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import { Component } from "@/domain/data";
import {
  useDimensionFormatters,
  useFormatFullDateAuto,
  useTimeFormatLocale,
} from "@/formatters";
import { TimeUnit } from "@/graphql/query-hooks";

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
          id: "iri-monthly",
          timeFormat: "%Y-%m",
          timeUnit: TimeUnit.Month,
          isNumerical: false,
          isKeyDimension: false,
          __typename: "TemporalDimension",
        } as Component,
        {
          id: "iri-yearly",
          timeFormat: "%Y",
          timeUnit: TimeUnit.Year,
          isNumerical: false,
          isKeyDimension: false,
          __typename: "TemporalDimension",
        } as Component,
        {
          id: "iri-number",
          isNumerical: true,
          isKeyDimension: false,
        } as Component,
        {
          id: "iri-currency",
          isNumerical: true,
          isKeyDimension: false,
          isCurrency: true,
          currencyExponent: 1,
          __typename: "NumericalMeasure",
        } as Component,
        {
          id: "iri-currency-int",
          isNumerical: true,
          isKeyDimension: false,
          isCurrency: true,
          currencyExponent: 1,
          resolution: 0,
          __typename: "NumericalMeasure",
        } as Component,
        {
          id: "iri-decimal",
          isNumerical: true,
          isKeyDimension: false,
          isDecimal: true,
          currencyExponent: 1,
          __typename: "NumericalMeasure",
        } as Component,
        {
          id: "iri-decimal-resolution",
          isNumerical: true,
          isKeyDimension: false,
          isDecimal: true,
          currencyExponent: 1,
          resolution: 2,
          __typename: "NumericalMeasure",
        } as Component,
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

  it("should work with decimal dimensions", () => {
    const { formatters } = setup();
    const formatter = formatters["iri-decimal"];

    expect(formatter("0.0001")).toEqual("0.0001");
    expect(formatter("0.00015467")).toEqual("0.00015467");
    expect(formatter("0.00001")).toEqual("1e-5");
    expect(formatter("0.000015467")).toEqual("1.5467e-5");
  });

  it("should work with decimal dimensions with resolution", () => {
    const { formatters } = setup();
    const formatter = formatters["iri-decimal-resolution"];

    expect(formatter("0.0001")).toEqual("0.0001");
    expect(formatter("0.00015467")).toEqual("0.00015467");
    expect(formatter("0.00001")).toEqual("1e-5");
    expect(formatter("0.000015467")).toEqual("1.55e-5");
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
