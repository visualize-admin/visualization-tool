import { DatePicker, DatePickerProps } from "@mui/lab";
import { DatePickerView } from "@mui/lab/DatePicker/shared";
import { Box, TextField } from "@mui/material";
import { timeFormat } from "d3-time-format";
import React from "react";

import { Label } from "@/components/form";
import { TimeUnit } from "@/graphql/resolver-types";

type DatePickerFieldProps = {
  name: string;
  label?: React.ReactNode;
  value: Date;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  isDateDisabled: (date: Date) => boolean;
  controls?: React.ReactNode;
  timeUnit?: DatePickerTimeUnit;
  dateFormat?: (d: Date) => string;
} & Omit<
  DatePickerProps<Date>,
  "value" | "onChange" | "shouldDisableDate" | "inputFormat" | "renderInput"
>;

export const DatePickerField = (props: DatePickerFieldProps) => {
  const {
    name,
    label,
    value,
    onChange,
    disabled,
    isDateDisabled,
    controls,
    timeUnit = TimeUnit.Day,
    dateFormat = timeFormat("%Y-%m-%d"),
    ...rest
  } = props;
  const handleChange = React.useCallback(
    (date: Date | null) => {
      if (!date || isDateDisabled(date)) {
        return;
      }

      const ev = {
        target: {
          value: dateFormat(date),
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange(ev);
    },
    [isDateDisabled, onChange, dateFormat]
  );

  const dateLimitProps = getDateRenderProps(timeUnit, isDateDisabled);

  return (
    <Box
      sx={{
        color: disabled ? "grey.300" : "grey.700",
        fontSize: "1rem",
      }}
    >
      {label && name && (
        <Label htmlFor={name} smaller sx={{ my: 1 }}>
          {label}
          {controls}
        </Label>
      )}
      <DatePicker<Date>
        {...rest}
        {...dateLimitProps}
        inputFormat={getInputFormat(timeUnit)}
        views={getViews(timeUnit)}
        value={value}
        onChange={handleChange}
        onYearChange={handleChange}
        renderInput={(params) => (
          <TextField
            hiddenLabel
            size="small"
            {...params}
            sx={{
              ...params.sx,

              "& input": {
                typography: "body2",
              },
            }}
          />
        )}
        disabled={disabled}
      />
    </Box>
  );
};

type DatePickerTimeUnit =
  | TimeUnit.Day
  | TimeUnit.Week
  | TimeUnit.Month
  | TimeUnit.Year;

export const canRenderDatePickerField = (
  timeUnit: TimeUnit
): timeUnit is DatePickerTimeUnit => {
  return [TimeUnit.Day, TimeUnit.Week, TimeUnit.Month, TimeUnit.Year].includes(
    timeUnit
  );
};

const getDateRenderProps = (
  timeUnit: DatePickerTimeUnit,
  isDateDisabled: (d: any) => boolean
):
  | { shouldDisableDate: DatePickerProps["shouldDisableDate"] }
  | { shouldDisableYear: DatePickerProps["shouldDisableYear"] } => {
  switch (timeUnit) {
    case TimeUnit.Day:
    case TimeUnit.Week:
    case TimeUnit.Month:
      return { shouldDisableDate: isDateDisabled };
    case TimeUnit.Year:
      return { shouldDisableYear: isDateDisabled };
    default:
      const _exhaustiveCheck: never = timeUnit;
      return _exhaustiveCheck;
  }
};

const getInputFormat = (timeUnit: DatePickerTimeUnit): string => {
  switch (timeUnit) {
    case TimeUnit.Day:
    case TimeUnit.Week:
      return "dd.MM.yyyy";
    case TimeUnit.Month:
      return "MM.yyyy";
    case TimeUnit.Year:
      return "yyyy";
    default:
      const _exhaustiveCheck: never = timeUnit;
      return _exhaustiveCheck;
  }
};

const getViews = (timeUnit: DatePickerTimeUnit): DatePickerView[] => {
  switch (timeUnit) {
    case TimeUnit.Day:
    case TimeUnit.Week:
      return ["year", "month", "day"];
    case TimeUnit.Month:
      return ["year", "month"];
    case TimeUnit.Year:
      return ["year"];
    default:
      const _exhaustiveCheck: never = timeUnit;
      return _exhaustiveCheck;
  }
};
