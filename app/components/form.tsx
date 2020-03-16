import {
  Box,
  Checkbox as RebassCheckbox,
  Input as RebassInput,
  Label as RebassLabel,
  Radio as RebassRadio,
  Select as RebassSelect,
  SelectProps
} from "@theme-ui/components";
import * as React from "react";
import { FieldProps, Option } from "../domain/config-form";

export const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children
}: {
  label?: string | React.ReactNode;
  htmlFor: string;
  disabled?: boolean;
  smaller?: boolean;
  children: React.ReactNode;
}) => (
  <RebassLabel
    htmlFor={htmlFor}
    mb={1}
    sx={{
      width: "auto",
      color: disabled ? "monochrome600" : "monochrome700",
      fontSize: smaller ? [2, 2, 2] : [4, 4, 4],
      pb: smaller ? 1 : 0,
      mr: 4
    }}
  >
    {children}
    {label && (
      <Box
        sx={{
          maxWidth: "75%",
          textAlign: "left",
          fontFamily: "body"
        }}
      >
        {label}
      </Box>
    )}
  </RebassLabel>
);

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange
}: { label: string | React.ReactNode; disabled?: boolean } & FieldProps) => {
  return (
    <Box mb={2}>
      <Label label={label} htmlFor={`${name}-${value}`} disabled={disabled}>
        <RebassRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          sx={{
            size: 20,
            color: checked && !disabled ? "primary" : "monochrome500"
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
  onChange
}: { label: React.ReactNode; disabled?: boolean } & FieldProps) => (
  <Box mb={4}>
    <Label label={label} htmlFor={`${name}-${label}`} disabled={disabled}>
      <RebassCheckbox
        sx={{
          size: 20,
          color: checked && !disabled ? "primary" : "monochrome500"
        }}
        id={`${name}-${label}`}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </Label>
  </Box>
);

export const Select = ({
  label,
  id,
  name,
  value,
  disabled,
  options,
  onChange
}: {
  id: string;
  options: Option[];
  label?: React.ReactNode;
  disabled?: boolean;
} & SelectProps) => (
  <Box sx={{ color: "monochrome700", pb: 2 }}>
    {label && (
      <Label htmlFor={id} smaller>
        {label}
      </Label>
    )}
    <RebassSelect
      sx={{
        borderColor: "monochrome500",
        fontSize: 4,
        bg: "monochrome100",
        p: 2
      }}
      id={id}
      name={id}
      onChange={onChange}
      value={value}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value || undefined}>
          {opt.value ? opt.label : "None"}
        </option>
      ))}
    </RebassSelect>
  </Box>
);

export const Input = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange
}: {
  label?: string | React.ReactNode;
  disabled?: boolean;
} & FieldProps) => (
  <Box sx={{ color: "monochrome700", fontSize: 4 }}>
    {label && name && (
      <Label htmlFor={name} smaller>
        {label}
      </Label>
    )}
    <RebassInput
      sx={{ borderColor: "monochrome500", bg: "monochrome100" }}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    />
  </Box>
);

// TODO
export const SearchField = () => (
  <Box>
    <Label htmlFor="email" smaller>
      Email
    </Label>
    <RebassInput
      id="email"
      name="email"
      type="email"
      placeholder="jane@example.com"
    />
  </Box>
);

export const FieldSetLegend = ({
  legendTitle
}: {
  legendTitle: string | React.ReactNode;
}) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      mb: 1,
      color: "monochrome600"
    }}
    as="legend"
  >
    {legendTitle}
  </Box>
);
