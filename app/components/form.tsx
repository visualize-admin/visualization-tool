import { Trans } from "@lingui/macro";
import { DatePicker, DatePickerProps } from "@mui/lab";
import {
  Box,
  BoxProps,
  ButtonBase,
  Checkbox as MUICheckbox,
  FormControlLabel,
  FormControlLabelProps,
  Input as MUIInput,
  InputProps,
  ListSubheader,
  MenuItem,
  Paper,
  PaperProps,
  Radio as MUIRadio,
  Select as MUISelect,
  SelectProps,
  Skeleton,
  Slider as MUISlider,
  SliderProps,
  Stack,
  styled,
  Switch as MUISwitch,
  TextField,
  Typography,
  TypographyProps,
} from "@mui/material";
import { useId } from "@reach/auto-id";
import { timeFormat } from "d3-time-format";
import flatten from "lodash/flatten";
import React, {
  ChangeEvent,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

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
import { valueComparator } from "@/utils/sorting-values";

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
}) => {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      variant={smaller ? "caption" : "body2"}
      color="secondary"
      display="flex"
      sx={sx}
    >
      {children}
    </Typography>
  );
};

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
  name,
  value,
  disabled,
  renderTextInput = true,
  onChange,
  sx,
  ...rest
}: {
  label?: string;
  renderTextInput?: boolean;
} & ReturnType<typeof useChartOptionSliderField> &
  // To allow useEvent callbacks to be passed without complaining
  Omit<SliderProps, "onChange">) => {
  return (
    <Box sx={sx}>
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
          disabled={disabled}
          // @ts-ignore
          onChange={onChange}
          {...rest}
        />
        {renderTextInput && (
          <MUIInput
            size="small"
            value={`${value}`}
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
        )}
      </Stack>
    </Box>
  );
};

export type CheckboxProps = {
  label: FormControlLabelProps["label"];
  disabled?: boolean;
  color?: string;
  smaller?: boolean;
  indeterminate?: boolean;
  className?: string;
} & FieldProps;

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
  className,
}: CheckboxProps) => (
  <FormControlLabel
    label={label || "-"}
    htmlFor={`${name}`}
    disabled={disabled}
    className={className}
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
    restOptions.sort(valueComparator(locale));
  }

  return [...noneOptions, ...restOptions];
};

export type Group = {
  label: string;
  value: string;
};

// Copied over from https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Menu/Menu.js
const MenuPaper = styled(Paper, {
  name: "MuiMenu",
  slot: "Paper",
  overridesResolver: (_props: PaperProps, styles) => styles.paper,
})({
  // specZ: The maximum height of a simple menu should be one or more rows less than the view
  // height. This ensures a tapable area outside of the simple menu with which to dismiss
  // the menu.
  maxHeight: "calc(100% - 96px)",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
});

const LoadingMenuPaperContext = React.createContext(
  false as boolean | undefined
);

/**
 * Shows a loading indicator when hierarchy is loading
 */
const LoadingMenuPaper = forwardRef<HTMLDivElement>(
  (props: PaperProps, ref) => {
    const loading = useContext(LoadingMenuPaperContext);
    return (
      <MenuPaper {...props} ref={ref}>
        {loading ? (
          <Box px={4} py={5}>
            <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
              <Trans id="hint.loading.data" />
            </Typography>
            <Skeleton sx={{ bgcolor: "grey.300" }} />
            <Skeleton sx={{ bgcolor: "grey.300" }} />
          </Box>
        ) : (
          props.children
        )}
      </MenuPaper>
    );
  }
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
  optionGroups,
  open,
  onClose,
  onOpen,
  loading,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
  sortOptions?: boolean;
  controls?: React.ReactNode;
  optionGroups?: [OptionGroup, Option[]][];
  loading?: boolean;
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
    <LoadingMenuPaperContext.Provider value={loading}>
      <Box>
        {label && (
          <Label htmlFor={id} smaller sx={{ my: 1 }}>
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
          open={open}
          onOpen={onOpen}
          onClose={onClose}
          MenuProps={{
            PaperProps: {
              // @ts-ignore - It works
              component: LoadingMenuPaper,
            },
          }}
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
    </LoadingMenuPaperContext.Provider>
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
  ...props
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
        ":focus": {
          outline: "none",
          borderColor: "primary.main",
        },
      }}
      size={smaller ? "small" : "medium"}
      variant="standard"
      id={id}
      name={id}
      onChange={onChange}
      value={value}
      disabled={disabled}
      {...props}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value || undefined}>
          {opt.label}
        </MenuItem>
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
  sx,
  inputRef,
  InputProps,
}: {
  id: string;
  label?: string | ReactNode;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  InputProps?: InputProps;
  inputRef?: React.RefObject<HTMLInputElement>;
  sx?: BoxProps["sx"];
} & FieldProps) => {
  const { search } = useBrowseContext();
  const onReset = InputProps?.onReset;
  const handleReset = useCallback(
    (ev) => {
      if (inputRef?.current) {
        inputRef.current.value = "";
      }
      onReset?.(ev);
    },
    [inputRef, onReset]
  );
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
        {...InputProps}
        placeholder={placeholder}
        autoComplete="off"
        inputRef={inputRef}
        sx={{ width: "100%", minHeight: 40, input: { borderRadius: 2 } }}
        endAdornment={
          onReset && search && search !== "" ? (
            <ButtonBase
              sx={{ p: 0, cursor: "pointer" }}
              onClick={handleReset}
              data-testid="clearSearch"
            >
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
      mb: 1,
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
