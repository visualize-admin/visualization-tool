import { Button, Text } from "@theme-ui/components";
import { SyntheticEvent } from "react";
import { FieldProps } from "../../configurator";
import { getFieldLabel, getIconName } from "../../domain/helpers";
import { Icon } from "../../icons";

export const ChartTypeSelectionButton = ({
  label,
  value,
  checked,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => void;
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
        mt: 4,
        borderRadius: "default",

        backgroundColor: checked ? "primary" : "monochrome100",
        color: checked
          ? "mutedColored"
          : disabled
          ? "monochrome500"
          : "primary",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        cursor: disabled ? "initial" : "pointer",
        pointerEvents: disabled ? "none" : "initial",

        transition: "all .2s",

        ":hover": {
          backgroundColor: disabled
            ? "mutedColored"
            : checked
            ? "primary"
            : "mutedDarker",
        },
      }}
    >
      <Icon name={getIconName(label)} />
      <Text
        variant="paragraph2"
        sx={{
          color: disabled
            ? "monochrome600"
            : checked
            ? "monochrome100"
            : "monochrome700",
          fontSize: [2, 2, 2],
        }}
      >
        {getFieldLabel(label)}
      </Text>
    </Button>
  );
};
