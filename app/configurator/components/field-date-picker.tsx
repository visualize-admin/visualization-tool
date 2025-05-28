import { DatePicker, DatePickerProps, PickersDay } from "@mui/lab";
import { DatePickerView } from "@mui/lab/DatePicker/shared";
import { Box, TextField } from "@mui/material";
import { timeFormat } from "d3-time-format";
import { ChangeEvent, ReactNode, useCallback } from "react";

import Flex from "@/components/flex";
import { Label } from "@/components/form";
import { TimeUnit } from "@/graphql/resolver-types";
import { Icon } from "@/icons";

export type DatePickerFieldProps = {
  name: string;
  label?: ReactNode;
  value: Date;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  isDateDisabled: (date: Date) => boolean;
  sideControls?: ReactNode;
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

      const e = {
        target: {
          value: dateFormat(date),
        },
      } as ChangeEvent<HTMLSelectElement>;

      onChange(e);
    },
    [isDateDisabled, onChange, dateFormat]
  );

  const dateLimitProps = getDateRenderProps(timeUnit, isDateDisabled);

  return (
    <Flex sx={{ flexDirection: "column", gap: 1 }}>
      {label && name && <Label htmlFor={name}>{label}</Label>}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          onChange={(date, keyboardInputValue) => {
            if (keyboardInputValue) {
              handleChange(date);
            }
          }}
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
                width: "100%",

                "& input": {
                  height: 40,
                  typography: "h6",
                },

                "& .MuiIconButton-root": {
                  p: 1,
                },

                "& .MuiOutlinedInput-input": {
                  py: 0,
                  pl: 4,
                },

                "& svg": {
                  color: "text.primary",
                },
              }}
            />
          )}
          disabled={disabled}
        />
        {sideControls}
      </Box>
    </Flex>
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
