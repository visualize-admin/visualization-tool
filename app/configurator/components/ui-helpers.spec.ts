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
