import React from "react";
import { Box, BoxProps } from "theme-ui";

const Stack = ({
  children,
  direction,
  spacing,
  ...boxProps
}: {
  children: React.ReactNode;
  direction?: "row" | "column";
  spacing?: number;
} & BoxProps) => {
  return (
    <Box
      {...boxProps}
      sx={{
        // The not(html) is there to increase specificity since
        // otherwise Text nodes have margin: 0 and it has higher
        // specificity due to CSS order
        "& > * + *:not(html)": {
          [direction === "row" ? "ml" : "mt"]: spacing,
        },
        ...boxProps.sx,
      }}
    >
      {children}
    </Box>
  );
};
Stack.defaultProps = {
  direction: "column",
  spacing: 1,
};

export default Stack;
