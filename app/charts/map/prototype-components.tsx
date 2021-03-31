import React, { ReactNode } from "react";
import { Box, Text } from "theme-ui";
import {
  ControlTabButton,
  ControlTabButtonInner,
} from "../../configurator/components/chart-controls/control-tab";
import { getIconName } from "../../configurator/components/ui-helpers";
import { FieldProps } from "../../configurator/config-form";
import { IconName } from "../../icons";
import { Control } from "./chart-map-prototype";

export const Label = ({
  label,
  disabled,
  smaller = false,
  children,
}: {
  label?: string | ReactNode;
  disabled?: boolean;
  smaller?: boolean;
  children?: ReactNode;
}) => (
  <Text
    sx={{
      width: "auto",
      color: disabled ? "monochrome500" : "monochrome700",
      fontSize: smaller ? [2, 2, 2] : [4, 4, 4],
      pb: smaller ? 1 : 0,
      mr: 4,
      my: 1,
      display: "flex",
      alignItems: "center",
    }}
  >
    {label}
  </Text>
);

// Light version of ControlTab (only for prototype)
export const Tab = ({
  value,
  onClick,
  iconName,
  upperLabel,
  lowerLabel,
  checked,
  disabled,
}: {
  disabled?: boolean;
  onClick: (x: Control) => void;
  value: Control;
  upperLabel: ReactNode;
  lowerLabel: string | ReactNode;
  iconName?: IconName;
} & FieldProps) => (
  <Box
    sx={{
      width: "100%",
      borderRadius: "default",
      my: "2px",
      pointerEvents: disabled ? "none" : "unset",
    }}
  >
    <ControlTabButton
      checked={checked}
      value={value}
      onClick={() => onClick(value)}
    >
      <ControlTabButtonInner
        iconName={iconName ?? getIconName(value)}
        upperLabel={upperLabel}
        lowerLabel={lowerLabel}
        checked={checked}
        optional={disabled}
      />
    </ControlTabButton>
  </Box>
);
