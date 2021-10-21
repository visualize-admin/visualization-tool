import { renderHook } from "@testing-library/react-hooks";
import { TimeUnit } from "../../graphql/query-hooks";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
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

  it("should be of correct length", () => {
    const { timeIntervalWithProps } = setup();
    expect(timeIntervalWithProps.range).toEqual(6);
  });

  it("should be of the same length as time interval select options", () => {
    const { timeIntervalWithProps } = setup();
    const timeIntervalFormattedSelectOptions =
      getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);

    expect(timeIntervalWithProps.range).toEqual(
      timeIntervalFormattedSelectOptions.length
    );
  });

  it("should match values to time interval select options", () => {
    const { timeIntervalWithProps } = setup();
    const timeIntervalFormattedSelectOptions =
      getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);

    expect(
      timeIntervalWithProps.formatDateValue(timeIntervalWithProps.fromDate)
    ).toEqual(timeIntervalFormattedSelectOptions[0].value);
    expect(
      timeIntervalWithProps.formatDateValue(timeIntervalWithProps.toDate)
    ).toEqual(timeIntervalFormattedSelectOptions[5].value);
  });
});
