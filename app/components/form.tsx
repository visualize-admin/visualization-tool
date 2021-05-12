import { Trans } from "@lingui/macro";
import VisuallyHidden from "@reach/visually-hidden";
import {
  Box,
  Button,
  Checkbox as TUICheckbox,
  Flex,
  Input as TUIInput,
  Label as TUILabel,
  Radio as TUIRadio,
  Select as TUISelect,
  SelectProps,
} from "theme-ui";
import { ReactNode, useMemo } from "react";
import { FieldProps, Option } from "../configurator";
import { Icon } from "../icons";
import { useId } from "@reach/auto-id";
import { useLocale } from "../locales/use-locale";

export const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children,
}: {
  label?: string | ReactNode;
  htmlFor: string;
  disabled?: boolean;
  smaller?: boolean;
  children: ReactNode;
}) => (
  <TUILabel
    htmlFor={htmlFor}
    mb={1}
    sx={{
      width: "auto",
      color: disabled ? "monochrome500" : "monochrome700",
      fontSize: smaller ? [2, 2, 2] : [4, 4, 4],
      pb: smaller ? 1 : 0,
      mr: 4,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
    {label && (
      <Box
        sx={{
          maxWidth: "88%",
          textAlign: "left",
          fontFamily: "body",
          pr: 1,
          fontSize: [3, 3, 4],
        }}
      >
        {label}
      </Box>
    )}
  </TUILabel>
);

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: { label: string | ReactNode; disabled?: boolean } & FieldProps) => {
  return (
    <Box mb={2}>
      <Label label={label} htmlFor={`${name}-${value}`} disabled={disabled}>
        <TUIRadio
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
                ? "primaryDisabled"
                : "monochrome500",
            "> *": {
              fill:
                checked && !disabled
                  ? "primary"
                  : checked && disabled
                  ? "primaryDisabled"
                  : "monochrome500",
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
}: { label: ReactNode; disabled?: boolean; color?: string } & FieldProps) => (
  <Label label={label} htmlFor={`${name}-${label}`} disabled={disabled}>
    <TUICheckbox
      data-name="checkbox-component"
      sx={{
        color:
          checked && !disabled
            ? "primary"
            : checked && disabled
            ? "primaryDisabled"
            : "monochrome500",
        "> *": {
          fill:
            color && checked
              ? color
              : checked && !disabled
              ? "primary"
              : checked && disabled
              ? "primaryDisabled"
              : "monochrome500",
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
  name,
  value,
  disabled,
  options,
  onChange,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
} & SelectProps) => {
  const locale = useLocale();
  const sortedOptions = useMemo(() => {
    const noneOptions = options.filter((o) => o.isNoneValue);
    const restOptions = options.filter((o) => !o.isNoneValue);

    return [
      ...noneOptions,
      ...restOptions.sort((a, b) => a.label.localeCompare(b.label, locale)),
    ];
  }, [options, locale]);

  return (
    <Box sx={{ color: "monochrome700", pb: 2 }}>
      {label && (
        <Label htmlFor={id} disabled={disabled} smaller>
          {label}
        </Label>
      )}
      <TUISelect
        sx={{
          borderColor: "monochrome500",
          fontSize: 4,
          bg: "monochrome100",
          pt: 2,
          pb: 2,
          pl: 2,
          pr: 5,
          height: "40px",
          color: disabled ? "monochrome500" : "monochrome700",
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
      </TUISelect>
    </Box>
  );
};

export const MiniSelect = ({
  label,
  id,
  name,
  value,
  disabled,
  options,
  onChange,
}: {
  id: string;
  options: Option[];
  label?: ReactNode;
  disabled?: boolean;
} & SelectProps) => (
  <Box sx={{ color: "monochrome800" }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <TUISelect
      sx={{
        borderColor: "transparent",
        fontSize: [1, 2, 2],
        fontFamily: "body",
        bg: "transparent",
        py: 0,
        pl: 1,
        pr: 4,
        mr: 1, // Fix for Chrome which cuts of the label otherwise
        ":focus": {
          outline: "none",
          borderColor: "primary",
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
    </TUISelect>
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
  <Box sx={{ color: "monochrome700", fontSize: 4 }}>
    {label && name && (
      <Label htmlFor={name} smaller>
        {label}
      </Label>
    )}
    <TUIInput
      sx={{ borderColor: "monochrome500", bg: "monochrome100", height: "40px" }}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    />
  </Box>
);

export const SearchField = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  onReset,
  onFocus,
  onBlur,
}: {
  id: string;
  label?: string | ReactNode;
  disabled?: boolean;
  value?: string;
  placeholder?: string;
  onReset?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
} & FieldProps) => {
  return (
    <Box sx={{ color: "monochrome700", fontSize: 4, position: "relative" }}>
      {label && id && (
        <label htmlFor={id}>
          <VisuallyHidden>{label}</VisuallyHidden>
        </label>
      )}
      <Box
        aria-hidden="true"
        sx={{ position: "absolute", top: "50%", mt: "-8px", ml: 2 }}
      >
        <Icon name="search" size={16} />
      </Box>
      <TUIInput
        sx={{
          borderColor: "monochrome500",
          bg: "monochrome100",
          px: 6,
          ":focus": { outline: "none", borderColor: "primary" },
        }}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value && value !== "" && onReset && (
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
              sx={{ borderRadius: "circle", bg: "monochrome600" }}
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
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      mb: 1,
      color: "monochrome600",
    }}
    as="legend"
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
      <TUILabel
        htmlFor={genId}
        sx={{ ":active div:after": { width: disabled ? "12px" : "16px" } }}
      >
        <TUICheckbox
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
            bg: checked ? "primary" : "monochrome100",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: checked ? "primary" : "monochrome500",

            transition: "300ms",

            ":after": {
              position: "absolute",
              content: "''",
              height: "12px",
              width: "12px",
              left: checked ? "calc(100% - 1px)" : "1px",
              bottom: "1px",
              bg: checked
                ? "monochrome100"
                : disabled
                ? "monochrome500"
                : "monochrome600",
              borderRadius: "12px",
              transition: "300ms",
              transform: checked ? "translateX(-100%)" : "unset",
            },
          }}
        ></Box>

        <Box
          as="span"
          sx={{
            fontSize: 2,
            ml: "32px",
            color: "monochrome700",
            cursor: disabled ? "default" : "pointer",
            pointerEvents: disabled ? "none" : "unset",
          }}
        >
          {label}
        </Box>
      </TUILabel>
    </Flex>
  );
};
