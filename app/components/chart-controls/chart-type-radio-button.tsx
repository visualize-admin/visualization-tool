import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { Flex } from "rebass";
import { Icon, IconName } from "../../icons";

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
        <Icon name={label as IconName} /> {label}
      </Flex>
    </label>
  );
};
