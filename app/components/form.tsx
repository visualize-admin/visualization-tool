import {
  Checkbox as RebassCheckbox,
  Input as RebassInput,
  Label as RebassLabel,
  Radio as RebassRadio,
  Select as RebassSelect
} from "@rebass/forms";
import * as React from "react";
import { Box, Flex } from "rebass";
import { FieldProps, Option } from "../domain/config-form";

export const Label = ({
  label,
  htmlFor,
  disabled,
  smaller = false,
  children
}: {
  label?: string | React.ReactNode;
  htmlFor: string | React.ReactNode;
  disabled?: boolean;
  smaller?: boolean;
  children: React.ReactNode;
}) => (
  <RebassLabel
    htmlFor={htmlFor}
    mb={1}
    sx={{
      width: "auto",
      color: disabled ? "monochrome.500" : "monochrome.600",
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
          color: "monochrome.700",
          fontFamily: "frutigerRegular"
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
      <Label label={label} htmlFor={`${name}-${value}`}>
        <RebassRadio
          name={name}
          id={`${name}-${value}`}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          sx={{ size: 20, color: checked ? "primary.base" : "monochrome.500" }}
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
}: { label: string; disabled?: boolean } & FieldProps) => (
  <Box mb={4}>
    <Label label={label} htmlFor={`${name}-${label}`} disabled={disabled}>
      <RebassCheckbox
        sx={{ size: 20, color: checked ? "primary.base" : "monochrome.500" }}
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
  name,
  value,
  checked,
  disabled,
  options,
  onChange
}: {
  options: Option[];
  label?: React.ReactNode;
  disabled?: boolean;
} & FieldProps) => (
  <Box sx={{ color: "monochrome.700", pb: 2 }}>
    {label && (
      <Label htmlFor={label} smaller>
        {label}
      </Label>
    )}
    <RebassSelect
      sx={{
        borderColor: "monochrome.500",
        fontSize: 4,
        bg: "monochrome.100",
        p: 2
      }}
      id={label}
      name={label}
      onChange={onChange}
      value={value}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
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
  label?: string;
  disabled?: boolean;
} & FieldProps) => (
  <Box sx={{ color: "monochrome.700", fontSize: 4 }}>
    {label && (
      <Label htmlFor={label} smaller>
        {label}
      </Label>
    )}
    <RebassInput
      sx={{ borderColor: "monochrome.500", bg: "monochrome.100" }}
      id={label}
      name={label}
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
  <Box variant="fieldSetLegend" as="legend">
    {legendTitle}
  </Box>
);
