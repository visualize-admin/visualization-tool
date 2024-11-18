import { DatePicker, DatePickerProps, PickersDay } from "@mui/lab";
import { DatePickerView } from "@mui/lab/DatePicker/shared";
import { Box, TextField } from "@mui/material";
import { timeFormat } from "d3-time-format";
import React, { useCallback } from "react";

import { Label } from "@/components/form";
import { TimeUnit } from "@/graphql/resolver-types";
import { Icon } from "@/icons";

export type DatePickerFieldProps = {
  name: string;
  label?: React.ReactNode;
  value: Date;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  isDateDisabled: (date: Date) => boolean;
  topControls?: React.ReactNode;
  sideControls?: React.ReactNode;
  timeUnit?: DatePickerTimeUnit;
  dateFormat?: (d: Date) => string;
  parseDate: (s: string) => Date | null;
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
    topControls,
    sideControls,
    timeUnit = TimeUnit.Day,
    dateFormat = timeFormat("%Y-%m-%d"),
    parseDate,
    ...rest
  } = props;
  const handleChange = useCallback(
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
      <Box
        sx={{
          display: "grid",
          gridTemplateAreas: `"topControls ." "datePicker sideControls"`,
          gridTemplateColumns: "1fr auto",
          columnGap: sideControls ? 2 : 0,
        }}
      >
        {label && name && (
          <Label htmlFor={name} smaller sx={{ gridArea: "topControls" }}>
            {label}
            {topControls}
          </Label>
        )}
        <Box sx={{ gridArea: "datePicker" }}>
          <DatePicker<Date>
            {...rest}
            {...dateLimitProps}
            components={{
              OpenPickerIcon: (props) => <Icon name="calendar" {...props} />,
            }}
            inputFormat={getInputFormat(timeUnit)}
            views={getViews(timeUnit)}
            value={value}
            onAccept={handleChange}
            // Need to pass onChange to avoid type error.
            onChange={() => {}}
            // We need to render the day picker ourselves to correctly highlight
            // the selected day. It's broken in the MUI date picker.
            renderDay={(day, _, dayPickerProps) => {
              return (
                <PickersDay
                  {...dayPickerProps}
                  selected={value.getTime() === day.getTime()}
                />
              );
            }}
            renderInput={(params) => (
              <TextField
                hiddenLabel
                size="small"
                {...params}
                onChange={(e) => {
                  handleChange(parseDate(e.target.value));
                }}
                sx={{
                  ...params.sx,

                  "& input": {
                    minHeight: "23px",
                    typography: "body2",
                  },
                }}
              />
            )}
            disabled={disabled}
          />
        </Box>
        <Box sx={{ gridArea: "sideControls", m: "auto" }}>{sideControls}</Box>
      </Box>
    </Box>
  );
};

export type DatePickerTimeUnit =
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
