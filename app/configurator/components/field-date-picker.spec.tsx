import { LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { timeFormat, timeParse } from "d3-time-format";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DatePickerField } from "@/configurator/components/field-date-picker";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { TimeUnit } from "@/graphql/resolver-types";
import { theme } from "@/themes/theme";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
  defineMessage: ({ message }: { message: string }) => message,
}));

describe("DatePickerField", () => {
  afterEach(cleanup);

  it("names the clear button and moves focus to the input after clearing", () => {
    const onChange = vi.fn();
    renderDatePicker({ onChange });

    const clear = screen.getByRole("button", { name: "Clear selection" });
    clear.focus();
    fireEvent.click(clear);

    expect(onChange).toHaveBeenCalledWith({
      target: { value: FIELD_VALUE_NONE },
    });
    expect(document.activeElement).toBe(
      document.querySelector<HTMLInputElement>('input[name="date-filter"]')
    );
  });

  it("does not clear or open while read only", () => {
    const onChange = vi.fn();
    renderDatePicker({ onChange, readOnly: true });

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    fireEvent.click(
      document.querySelector<HTMLInputElement>('input[name="date-filter"]')!
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      document
        .querySelector<HTMLInputElement>('input[name="date-filter"]')
        ?.getAttribute("aria-disabled")
    ).toBe("true");
  });
});

const renderDatePicker = ({
  onChange,
  readOnly,
}: {
  onChange: (e: { target: { value: string } }) => void;
  readOnly?: boolean;
}) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <DatePickerField
          name="date-filter"
          label="Date"
          value={new Date(2024, 0, 1)}
          onChange={onChange}
          isDateDisabled={() => false}
          timeUnit={TimeUnit.Day}
          dateFormat={timeFormat("%Y-%m-%d")}
          parseDate={timeParse("%Y-%m-%d")}
          showClearButton
          readOnly={readOnly}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};
