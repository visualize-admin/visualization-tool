import * as React from "react";
import { Button, Text } from "rebass";
import { FieldProps } from "../../domain/config-form";
import { Icon } from "../../icons";
import { getIconName } from "../helpers";

export const ChartTypeRadio = ({
  label,
  value,
  checked,
  disabled,
  onClick
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
} & FieldProps) => {
  return (
    <Button
      variant="chartTypeRadio"
      tabIndex={0}
      value={value}
      onClick={onClick}
      sx={{
        m: 2,
        justifyContent: "center",
        display: "flex",
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
      <Icon name={getIconName(label)} />
      <Text
        variant="paragraph2"
        sx={{ color: checked ? "monochrome.100" : "monochrome.600" }}
      >
        {label}
      </Text>
    </Button>
  );
};
