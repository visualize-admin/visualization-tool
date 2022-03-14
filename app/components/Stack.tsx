import Flex, { FlexProps } from "../components/flex";
import React from "react";

type DirectionType = "row" | "column";

const Stack = ({
  children,
  direction = "column",
  spacing = 1,
  ...flexProps
}: {
  children: React.ReactNode;
  direction?: DirectionType | DirectionType[];
  spacing?: number;
} & FlexProps) => {
  const directions = Array.isArray(direction) ? direction : [direction];
  return (
    <Flex
      {...flexProps}
      sx={{
        flexDirection: directions,
        flexWrap: "wrap",
        gap: spacing,
        ...flexProps.sx,
      }}
    >
      {children}
    </Flex>
  );
};

export default Stack;
