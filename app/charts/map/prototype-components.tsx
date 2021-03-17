import { ReactNode } from "react";
import { Box, Text } from "theme-ui";

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
