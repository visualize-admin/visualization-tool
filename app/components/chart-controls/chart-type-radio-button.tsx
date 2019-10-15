import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { Flex } from "rebass";

export const ChartTypeRadio = ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange
}: { label: string; disabled?: boolean } & FieldProps) => {
  return (
    <label htmlFor={label} style={{ display: "inline" }}>
      <input
        type="radio"
        name={name}
        id={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ display: "none" }}
      />
      <Flex
        aria-hidden="true"
        variant="chartTypeRadio"
        sx={{
          m: 2,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: checked ? "monochrome.100" : "primary.base",
          backgroundColor: checked ? "primary.base" : "monochrome.100",
          ":hover": {
            backgroundColor: checked ? "monochrome.500" : "muted"
          }
        }}
      >
        <Icon /> {label}
      </Flex>
    </label>
  );
};

export const Icon = ({ size = 50, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12" y2="17"></line>
  </svg>
);
