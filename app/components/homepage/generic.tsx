import { Text } from "@theme-ui/components";
import * as React from "react";

export const HomepageSection = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Text
    sx={{
      fontFamily: "body",
      lineHeight: [7, 8, 8],
      fontWeight: "light",
      fontSize: [6, 7, 7],
      color: "monochrome800",
      mb: 6,
      textAlign: "center",
    }}
  >
    {children}
  </Text>
);
