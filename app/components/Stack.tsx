import React from "react";
import { Box, BoxProps } from "theme-ui";

type DirectionType = "row" | "column";

const Stack = ({
  children,
  direction,
  spacing,
  ...boxProps
}: {
  children: React.ReactNode;
  direction?: DirectionType | DirectionType[];
  spacing?: number;
} & BoxProps) => {
  const directions = Array.isArray(direction) ? direction : [direction];
  return (
    <Box
      {...boxProps}
      sx={{
        // The not(html) is there to increase specificity since
        // otherwise Text nodes have margin: 0 and it has higher
        // specificity due to CSS order
        "& > * + *:not(html)": {
          ml: directions.map((d) => (d === "row" ? spacing : 0)),
          mt: directions.map((d) => (d !== "row" ? spacing : 0)),
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
