import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { Flex, Text } from "rebass";
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
    <>
      <label htmlFor={label}>
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
          variant="chartTypeRadio"
          tabIndex={0}
          // onClick={() => onChange()} FIXME: not keyboard selectable
          sx={{
            m: 2,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            cursor: disabled ? "initial" : "pointer",
            color: checked
              ? "blueGrey"
              : disabled
              ? "monochrome.300"
              : "primary.base",
            backgroundColor: checked ? "primary.base" : "monochrome.100",
            ":hover": {
              backgroundColor: disabled
                ? "blueGrey"
                : checked
                ? "primary.base"
                : "monochrome.300"
            }
          }}
        >
          <Icon name={label as IconName} />
          <Text
            variant="paragraph2"
            sx={{ color: checked ? "monochrome.100" : "monochrome.600" }}
          >
            {label}
          </Text>
        </Flex>
      </label>
    </>
  );
};
