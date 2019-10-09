import {
  Checkbox as RebassCheckbox,
  Input as RebassInput,
  Label as RebassLabel,
  Radio as RebassRadio,
  Select as RebassSelect
} from "@rebass/forms";
import * as React from "react";
import { Box } from "rebass";
import { FieldProps } from "../domain/config-form";

const Label = ({
  htmlFor,
  children
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <RebassLabel
    htmlFor={htmlFor}
    sx={{ color: "monochrome.700", fontSize: [4, 4, 4] }}
  >
    {children}
  </RebassLabel>
);

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange
}: { label: string; disabled?: boolean } & FieldProps) => {
  return (
    <Label htmlFor={label}>
      <RebassRadio
        name={name}
        id={label}
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        sx={{ size: 20, color: checked ? "primary.base" : "monochrome.500" }}
      />
      {label}
    </Label>
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
  <Label htmlFor={label}>
    <RebassCheckbox
      sx={{ size: 20, color: checked ? "primary.base" : "monochrome.500" }}
      id={label}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
    {label}
  </Label>
);

// TODO
export const Select = ({
  label,
  options,
  onChange
}: {
  label: string;
  options: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box>
    <Label htmlFor={label}>{label}</Label>
    <RebassSelect id={label} name={label} onChange={onChange}>
      {options.map(opt => (
        <option key={opt.value as string}>{opt.name}</option>
      ))}
    </RebassSelect>
  </Box>
);

export const Input = () => (
  <Box>
    <Label htmlFor="Kanton">Kanton</Label>
    <RebassInput
      id="Kanton"
      name="Kanton"
      type="Kanton"
      placeholder="Zürich..."
    />
  </Box>
);

export const SearchField = () => (
  <Box>
    <Label htmlFor="email">Email</Label>
    <RebassInput
      id="email"
      name="email"
      type="email"
      placeholder="jane@example.com"
    />
  </Box>
);
