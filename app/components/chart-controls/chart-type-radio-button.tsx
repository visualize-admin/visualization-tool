import * as React from "react";
import { Button, Text } from "@theme-ui/components";
import { FieldProps } from "../../domain/config-form";
import { Icon } from "../../icons";
import { getIconName, getFieldLabel } from "../../domain/helpers";

export const ChartTypeSelectionButton = ({
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
          ? "monochrome300"
          : "primary",
        backgroundColor: checked ? "primary" : "monochrome100",
        ":hover": {
          backgroundColor: disabled
            ? "blueGrey"
            : checked
            ? "primary"
            : "monochrome300"
        }
      }}
    >
      <Icon name={getIconName(label)} />
      <Text
        variant="paragraph2"
        sx={{ color: checked ? "monochrome100" : "monochrome600" }}
      >
        {getFieldLabel(label)}
      </Text>
    </Button>
  );
};
