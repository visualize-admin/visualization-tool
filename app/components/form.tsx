import { Trans } from "@lingui/macro";
import { DatePicker, DatePickerProps } from "@mui/lab";
import {
  Box,
  BoxProps,
  ButtonBase,
  Checkbox as MUICheckbox,
  FormControlLabel,
  Input as MUIInput,
  Radio as MUIRadio,
  Select as MUISelect,
  Slider as MUISlider,
  Switch as MUISwitch,
  SelectProps,
  Typography,
  TextField,
  ListSubheader,
  MenuItem,
  TypographyProps,
  Stack,
} from "@mui/material";
import { useId } from "@reach/auto-id";
import { timeFormat } from "d3-time-format";
import { flatten } from "lodash";
import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";

import VisuallyHidden from "@/components/visually-hidden";
import {
  FieldProps,
  Option,
  OptionGroup,
  useChartOptionSliderField,
} from "@/configurator";
import { useBrowseContext } from "@/configurator/components/dataset-browse";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

export const Label = ({
  htmlFor,
  smaller = false,
  children,
  sx,
}: {
  htmlFor: string;
  smaller?: boolean;
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => (
  <Typography
    component="label"
    htmlFor={htmlFor}
    variant={smaller ? "caption" : "body1"}
    color="secondary"
    display="flex"
    sx={sx}
  >
    {children}
  </Typography>
);

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  disabled?: boolean;
} & FieldProps) => {
  const color = checked
    ? disabled
      ? "primary.disabled"
      : "primary"
    : "grey.500";

  return (
    <FormControlLabel
      label={label || "-"}
      htmlFor={`${name}-${value}`}
      componentsProps={{
        typography: {
          variant: "body2",
        },
      }}
      control={
        <MUIRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={!!checked}
          disabled={disabled}
          size="small"
          sx={{ color, "> *": { fill: color } }}
        />
      }
      disabled={disabled}
    />
  );
};

export const Slider = ({
  label,
  disabled,
  min,
  max,
  step,
  name,
  value,
  onChange,
  ...rest
}: {
  label?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
} & ReturnType<typeof useChartOptionSliderField> &
  BoxProps) => {
  return (
    <Box {...rest}>
      {label && (
        <Label htmlFor={`${name}-${value}`} smaller sx={{ mb: 1 }}>
          {label}
        </Label>
      )}
      <Stack
        direction="row"
        gap={4}
        justifyContent="center"
        alignItems="center"
      >
        <MUISlider
          name={name}
          id={`${name}-${value}`}
          size="small"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          // @ts-ignore
          onChange={onChange}
        />
        <MUIInput
          size="small"
          value={value.toString()}
          disabled={disabled}
          onChange={onChange}
          sx={{
            width: 50,
            height: 30,
            minHeight: 0,

            ".MuiInput-input": {
              p: 0,
              textAlign: "center",
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export const Checkbox = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
  color,
  smaller,
  indeterminate,
}: {
  label: string;
  disabled?: boolean;
  color?: string;
  smaller?: boolean;
  indeterminate?: boolean;
} & FieldProps) => (
  <FormControlLabel
    label={label || "-"}
    htmlFor={`${name}-${label}`}
    disabled={disabled}
    componentsProps={{
      typography: {
        variant: smaller ? "caption" : "body2",
        color: "grey.800",
      },
    }}
    control={
      <MUICheckbox
        data-name="checkbox-component"
        size={smaller ? "small" : "medium"}
        id={name}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        indeterminate={indeterminate}
        sx={{
          alignSelf: "start",
          svg: { color },
          input: { color },
        }}
      />
    }
    sx={{ display: "flex" }}
  />
);

const getSelectOptions = (
  options: Option[],
  sortOptions: boolean,
  locale: string
) => {
  const noneOptions = options.filter((o) => o.isNoneValue);
  const restOptions = options.filter((o) => !o.isNoneValue);

  if (sortOptions) {
    restOptions.sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position < b.position;
      } else {
        return a.label.localeCompare(b.label, locale);
      }
    });
  }

  return [...noneOptions, ...restOptions];
};

export type Group = {
  label: string;
  value: string;
};

export const Select = ({
  label,
  id,
  value,
  disabled,
  options,
  onChange,
  sortOptions = true,
  controls,
  optionGroups,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
  sortOptions?: boolean;
  controls?: React.ReactNode;
  optionGroups?: [OptionGroup, Option[]][];
} & SelectProps) => {
  const locale = useLocale();

  const sortedOptions = useMemo(() => {
    if (optionGroups) {
      return flatten(
        optionGroups.map(
          ([group, values]) =>
            [
              { type: "group", ...group },
              ...getSelectOptions(values, sortOptions, locale),
            ] as const
        )
      );
    } else {
      return getSelectOptions(options, sortOptions, locale);
    }
  }, [optionGroups, sortOptions, locale, options]);
  return (
    <Box>
      {label && (
        <Label htmlFor={id} smaller sx={{ mb: 1 }}>
          {label}
          {controls}
        </Label>
      )}
      <MUISelect
        sx={{
          width: "100%",
        }}
        id={id}
        name={id}
        onChange={onChange}
        value={value}
        disabled={disabled}
      >
        {sortedOptions.map((opt) => {
          if (!opt.value) {
            return null;
          }
          return opt.type === "group" ? (
            <ListSubheader key={opt.label}>{opt.label}</ListSubheader>
          ) : (
            <MenuItem
              key={opt.value}
              disabled={opt.disabled}
              value={opt.value ?? undefined}
            >
              {opt.label}
            </MenuItem>
          );
        })}
      </MUISelect>
    </Box>
  );
};

export const MinimalisticSelect = ({
  label,
  id,
  value,
  options,
  onChange,
  smaller = false,
  disabled,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
  smaller?: boolean;
} & SelectProps) => (
  <Box sx={{ color: "grey.800" }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <MUISelect
      sx={{
        borderColor: "transparent",
        fontSize: smaller ? ["0.625rem", "0.75rem", "0.75rem"] : "inherit",
        lineHeight: "normal !important",

        backgroundColor: "transparent",
        p: 0,
        pl: 1,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        "& > select": {
          p: 0,
        },
        ":focus": {
          outline: "none",
          borderColor: "primary.main",
        },
      }}
      native
      size={smaller ? "small" : "medium"}
      variant="standard"
      id={id}
      name={id}
      onChange={onChange}
      value={value}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value || undefined}>
          {opt.label}
        </option>
      ))}
    </MUISelect>
  </Box>
);

export const Input = ({
  label,
  name,
  value,
  disabled,
  onChange,
}: {
  label?: string | ReactNode;
  disabled?: boolean;
} & FieldProps) => (
  <Box sx={{ fontSize: "1rem", pb: 2 }}>
    {label && name && (
      <Label htmlFor={name} smaller sx={{ mb: 1 }}>
        {label}
      </Label>
    )}
    <MUIInput
      id={name}
      size="small"
      color="secondary"
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      sx={{
        borderColor: "grey.500",
        backgroundColor: "grey.100",
        width: "100%",
      }}
    />
  </Box>
);

const formatDate = timeFormat("%Y-%m-%d");

export const DayPickerField = ({
  label,
  name,
  value,
  isDayDisabled,
  onChange,
  disabled,
  controls,
  ...props
}: {
  name: string;
  value: Date;
  isDayDisabled: (day: Date) => boolean;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  controls?: ReactNode;
  label?: string | ReactNode;
  disabled?: boolean;
} & Omit<
  DatePickerProps<Date>,
  | "onChange"
  | "value"
  | "shouldDisableDate"
  | "onChange"
  | "inputFormat"
  | "renderInput"
>) => {
  const handleChange = useCallback(
    (day: Date | null) => {
      if (!day) {
        return;
      }
      const isDisabled = isDayDisabled(day);
      if (isDisabled) {
        return;
      }

      const ev = {
        target: {
          value: formatDate(day),
        },
      } as ChangeEvent<HTMLSelectElement>;

      onChange(ev);
    },
    [isDayDisabled, onChange]
  );

  return (
    <Box
      sx={{
        color: disabled ? "grey.300" : "grey.700",
        fontSize: "1rem",
      }}
    >
      {label && name && (
        <Label htmlFor={name} smaller>
          {label}
          {controls}
        </Label>
      )}
      <DatePicker<Date>
        {...props}
        inputFormat="dd.MM.yyyy"
        views={["day"]}
        value={value}
        shouldDisableDate={isDayDisabled}
        onChange={handleChange}
        onYearChange={handleChange}
        renderInput={(params) => (
          <TextField hiddenLabel size="small" {...params} />
        )}
        disabled={disabled}
      />
    </Box>
  );
};

export const SearchField = ({
  id,
  label,
  value,
  defaultValue,
  placeholder,
  onKeyPress,
  onReset,
  onFocus,
  onBlur,
  sx,
  inputRef,
}: {
  id: string;
  label?: string | ReactNode;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  onKeyPress?: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
  onReset?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { search } = useBrowseContext();
  const handleReset = useCallback(() => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
    onReset?.();
  }, [inputRef, onReset]);
  return (
    <Box
      sx={{ color: "grey.700", fontSize: "1rem", position: "relative", ...sx }}
    >
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <MUIInput
        startAdornment={<Icon name="search" size={16} />}
        id={id}
        value={value}
        defaultValue={defaultValue}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
        inputRef={inputRef}
        sx={{ width: "100%", input: { borderRadius: 2 } }}
        endAdornment={
          onReset && search && search !== "" ? (
            <ButtonBase sx={{ p: 0, cursor: "pointer" }} onClick={handleReset}>
              <VisuallyHidden>
                <Trans id="controls.search.clear">Clear search field</Trans>
              </VisuallyHidden>
              <Box
                aria-hidden="true"
                sx={{ borderRadius: "50%", mr: "0.25rem" }}
              >
                <Icon name="close" size={16} color="secondary" />
              </Box>
            </ButtonBase>
          ) : null
        }
      />
    </Box>
  );
};

export const FieldSetLegend = ({
  legendTitle,
  sx,
}: {
  legendTitle: string | ReactNode;
  sx?: TypographyProps["sx"];
}) => (
  <Typography
    variant="caption"
    color="secondary"
    component="legend"
    sx={{
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "regular",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      pl: 0,
      ...sx,
    }}
  >
    {legendTitle}
  </Typography>
);

export const Switch = ({
  id,
  label,
  name,
  checked,
  disabled,
  onChange,
}: {
  id?: string;
  label: React.ComponentProps<typeof FormControlLabel>["label"];
  disabled?: boolean;
} & FieldProps) => {
  const genId = `switch-${useId(id)}`;

  return (
    <FormControlLabel
      htmlFor={genId}
      label={label}
      componentsProps={{
        typography: {
          variant: "body2",
          color: "grey.800",
        },
      }}
      control={
        <MUISwitch
          id={genId}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      }
      sx={{ fontSize: "0.875rem" }}
    />
  );
};
