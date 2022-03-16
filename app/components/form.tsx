import { Trans } from "@lingui/macro";
import { useId } from "@reach/auto-id";
import VisuallyHidden from "@reach/visually-hidden";
import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";
import { DayPickerInputProps, DayPickerProps } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import {
  Box,
  BoxProps,
  Button,
  Checkbox as MUICheckbox,
  Input as MUIInput,
  InputLabel,
  Radio as MUIRadio,
  Select as MUISelect,
  SelectProps,
} from "@mui/material";
import Flex from "./flex";
import { FieldProps, Option } from "../configurator";
import { useBrowseContext } from "../configurator/components/dataset-browse";
import { useTimeFormatUnit } from "../configurator/components/ui-helpers";
import { TimeUnit } from "../graphql/query-hooks";
import { Icon } from "../icons";
import { useLocale } from "../locales/use-locale";

export const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children,
}: {
  label?: string;
  htmlFor: string;
  disabled?: boolean;
  smaller?: boolean;
  children: ReactNode;
}) => (
  <InputLabel
    htmlFor={htmlFor}
    size={smaller ? "small" : undefined}
    sx={{
      cursor: "pointer",
      width: "auto",
      color: disabled ? "grey.500" : "grey.700",
      mr: 4,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
    {label && <Box title={label}>{label}</Box>}
  </InputLabel>
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
    <Box mb={2}>
      <Label label={label} htmlFor={`${name}-${value}`} disabled={disabled}>
        <MUIRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          size={20}
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
      </Label>
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
}: {
  label: string;
  disabled?: boolean;
  color?: string;
  smaller?: boolean;
} & FieldProps) => (
  <Label
    label={label}
    htmlFor={`${name}-${label}`}
    disabled={disabled}
    smaller={smaller}
  >
    <MUICheckbox
      data-name="checkbox-component"
      sx={{
        width: smaller ? 16 : undefined,
        height: smaller ? 16 : undefined,
        mr: smaller ? 1 : undefined,
        color:
          checked && !disabled
            ? "primary.main"
            : checked && disabled
            ? "primary.disabled"
            : "grey.500",
        "> *": {
          fill:
            color && checked
              ? color
              : checked && !disabled
              ? "primary.main"
              : checked && disabled
              ? "primary.disabled"
              : "grey.500",
        },
      }}
      id={`${name}-${label}`}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
  </Label>
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
        <Label htmlFor={id} disabled={disabled} smaller>
          {label}
          {controls}
        </Label>
      )}
      <MUISelect
        sx={{
          borderColor: "grey.500",
          fontSize: "1rem",
          backgroundColor: "grey.100",
          pt: 2,
          pb: 2,
          pl: 2,
          pr: 5,
          height: "40px",
          color: disabled ? "grey.500" : "grey.700",
          textOverflow: "ellipsis",
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

export const MiniSelect = ({
  label,
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
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
        fontSize: ["0.625rem", "0.75rem", "0.75rem"],

        backgroundColor: "transparent",
        py: 0,
        pl: 1,
        pr: 4,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        ":focus": {
          outline: "none",
          borderColor: "primary.main",
        },
      }}
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
  <Box sx={{ color: "grey.700", fontSize: "1rem", pb: 2 }}>
    {label && name && (
      <Label htmlFor={name} smaller>
        {label}
      </Label>
    )}
    <MUIInput
      sx={{
        borderColor: "grey.500",
        backgroundColor: "grey.100",
        height: "40px",
      }}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    />
  </Box>
);

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
} & Omit<DayPickerInputProps, "onChange" | "disabledDays">) => {
  const handleDayClick = useCallback(
    (day: Date) => {
      const isDisabled = isDayDisabled(day);

      if (!isDisabled) {
        const ev = {
          currentTarget: {
            value: day.toISOString().slice(0, 10),
          },
        } as ChangeEvent<HTMLSelectElement>;

        onChange(ev);
      }
    },
    [isDayDisabled, onChange]
  );
  const formatDateAuto = useTimeFormatUnit();
  const inputProps = useMemo(() => {
    return {
      name,
      formatDate: formatDateAuto,
      value: formatDateAuto(value, TimeUnit.Day),
      disabled,
      ...props.inputProps,
      style: {
        padding: "0.625rem 0.75rem",
        color: disabled ? "grey.300" : "grey.700",
        fontSize: "1rem",
        minHeight: "1.5rem",
        display: "block",
        borderRadius: "0.25rem",
        width: "100%",
        border: "1px solid var(--theme-ui-colors-grey.500)",

        // @ts-ignore
        ...props.inputProps?.style,
      },
    } as DayPickerInputProps;
  }, [name, formatDateAuto, value, disabled, props.inputProps]);

  const dayPickerProps = useMemo(() => {
    return {
      onDayClick: handleDayClick,
      disabledDays: isDayDisabled,
      ...props.dayPickerProps,
    } as DayPickerProps;
  }, [handleDayClick, isDayDisabled, props.dayPickerProps]);

  return (
    <Box
      sx={{
        color: disabled ? "grey.300" : "grey.700",
        fontSize: "1rem",
        pb: 2,
      }}
    >
      {label && name && (
        <Label htmlFor={name} smaller disabled={disabled}>
          {label}
          {controls}
        </Label>
      )}
      <DayPickerInput
        value={value}
        style={{ width: "100%", color: "inherit" }}
        {...props}
        inputProps={inputProps}
        dayPickerProps={dayPickerProps}
      />
      {/* <DayPicker selectedDays={new Date()} /> */}
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
  inputRef?: React.Ref<HTMLInputElement>;
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { search } = useBrowseContext();
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
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
        ref={inputRef}
      />
      {onReset && search && search !== "" && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 0,
            mt: "-8px",
            mr: 2,
          }}
        >
          <Button
            variant="reset"
            sx={{ p: 0, cursor: "pointer" }}
            onClick={onReset}
          >
            <VisuallyHidden>
              <Trans id="controls.search.clear">Clear search field</Trans>
            </VisuallyHidden>
            <Box
              aria-hidden="true"
              sx={{ borderRadius: "circle", backgroundColor: "grey.600" }}
            >
              <Icon name="clear" size={16} />
            </Box>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export const FieldSetLegend = ({
  legendTitle,
}: {
  legendTitle: string | ReactNode;
}) => (
  <Box
    sx={{
      lineHeight: ["1rem", "1.125rem", "1.125rem"],
      fontWeight: "regular",
      fontSize: ["0.625rem", "0.75rem", "0.75rem"],
      mb: 1,
      color: "grey.800",
    }}
    component="legend"
  >
    {legendTitle}
  </Box>
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
  label: React.ReactNode;
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
      <InputLabel
        htmlFor={genId}
        sx={{ ":active div:after": { width: disabled ? "12px" : "16px" } }}
      >
        <MUICheckbox
          id={genId}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          sx={{
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            cursor: disabled ? "default" : "pointer",
            pointerEvents: disabled ? "none" : "unset",
            width: "32px",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? "primary" : "grey.100",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: checked ? "primary" : "grey.500",

            transition: "300ms",

            ":after": {
              position: "absolute",
              content: "''",
              height: "12px",
              width: "12px",
              left: checked ? "calc(100% - 1px)" : "1px",
              bottom: "1px",
              backgroundColor: checked
                ? "grey.100"
                : disabled
                ? "grey.500"
                : "grey.600",
              borderRadius: "12px",
              transition: "300ms",
              transform: checked ? "translateX(-100%)" : "unset",
            },
          }}
        ></Box>

        <Box
          component="span"
          sx={{
            fontSize: "0.75rem",
            ml: "32px",
            color: "grey.700",
            cursor: disabled ? "default" : "pointer",
            pointerEvents: disabled ? "none" : "unset",
          }}
        >
          {label}
        </Box>
      </InputLabel>
    </Flex>
  );
};
