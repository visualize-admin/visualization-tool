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
  Switch as MUISwitch,
  SelectProps,
  Typography,
  TextField,
} from "@mui/material";
import { useId } from "@reach/auto-id";
import { timeFormat } from "d3-time-format";
import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";

import Flex from "@/components/flex";
import VisuallyHidden from "@/components/visually-hidden";
import { FieldProps, Option } from "@/configurator";
import { useBrowseContext } from "@/configurator/components/dataset-browse";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

export const Label = ({
  label,
  htmlFor,
  smaller = false,
  children,
}: {
  label?: string;
  htmlFor: string;
  smaller?: boolean;
  children: ReactNode;
}) => (
  <Typography
    component="label"
    htmlFor={htmlFor}
    variant={smaller ? "caption" : "body1"}
    display="flex"
    sx={{ color: "grey.600" }}
  >
    {children}
    {label && (
      <Box sx={{ mb: 1 }} title={label}>
        {label}
      </Box>
    )}
  </Typography>
);

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: { label: string; disabled?: boolean } & FieldProps) => {
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
          sx={{
            color:
              checked && !disabled
                ? "primary"
                : checked && disabled
                ? "primary.disabled"
                : "grey.500",
            "> *": {
              fill:
                checked && !disabled
                  ? "primary"
                  : checked && disabled
                  ? "primary.disabled"
                  : "grey.500",
            },
          }}
        />
      }
      disabled={disabled}
    />
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
    sx={{ display: "flex", ml: 0 }}
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
        id={`${name}-${label}`}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        indeterminate={indeterminate}
        sx={{
          alignSelf: "start",
          mr: smaller ? 0 : 1,
          svg: { color },
          input: { color },
        }}
      />
    }
  />
);

export const Select = ({
  label,
  id,
  value,
  disabled,
  options,
  onChange,
  sortOptions = true,
  controls,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
  sortOptions?: boolean;
  controls?: React.ReactNode;
} & SelectProps) => {
  const locale = useLocale();
  const sortedOptions = useMemo(() => {
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
  }, [options, locale, sortOptions]);

  return (
    <Box sx={{ color: "grey.700" }}>
      {label && (
        <Label htmlFor={id} smaller>
          {label}
          {controls}
        </Label>
      )}
      <MUISelect
        native
        sx={{
          borderColor: "grey.500",
          backgroundColor: "grey.100",
          pl: 0,
          height: "40px",
          color: disabled ? "grey.500" : "grey.700",
          textOverflow: "ellipsis",
          width: "100%",
        }}
        id={id}
        name={id}
        onChange={onChange}
        value={value}
        disabled={disabled}
      >
        {sortedOptions.map((opt) => (
          <option
            key={opt.value}
            disabled={opt.disabled}
            value={opt.value ?? undefined}
          >
            {opt.label}
          </option>
        ))}
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
  checked,
  disabled,
  onChange,
}: {
  label?: string | ReactNode;
  disabled?: boolean;
} & FieldProps) => (
  <Box sx={{ color: "grey.600", fontSize: "1rem", pb: 2 }}>
    {label && name && (
      <Label htmlFor={name} smaller>
        {label}
      </Label>
    )}
    <MUIInput
      sx={{
        borderColor: "grey.500",
        backgroundColor: "grey.100",
        width: "100%",
      }}
      size="small"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
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
                sx={{ borderRadius: "50%", color: "grey.600", mr: "0.25rem" }}
              >
                <Icon name="close" size={16} />
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
}: {
  legendTitle: string | ReactNode;
}) => (
  <Typography
    variant="caption"
    sx={{
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "regular",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      color: "grey.600",
      pl: 0,
    }}
    component="legend"
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
    <Flex
      sx={{
        position: "relative",
        height: "16px",
        alignItems: "center",
      }}
    >
      <FormControlLabel
        htmlFor={genId}
        label={label}
        componentsProps={{
          typography: {
            variant: "body2",
            color: "grey.800",
          },
        }}
        sx={{ fontSize: "0.875rem" }}
        control={
          <MUISwitch
            id={genId}
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
        }
      />
    </Flex>
  );
};
