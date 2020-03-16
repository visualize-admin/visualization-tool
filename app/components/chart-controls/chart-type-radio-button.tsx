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
      variant="reset"
      tabIndex={0}
      value={value}
      onClick={onClick}
      sx={{
        width: "86px",
        height: "86px",
        mx: 4,
        my: 2,

        borderRadius: "default",

        backgroundColor: checked ? "primary" : "monochrome100",
        color: checked ? "blueGrey" : disabled ? "monochrome300" : "primary",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        cursor: disabled ? "initial" : "pointer",
        transition: "all .2s",

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
