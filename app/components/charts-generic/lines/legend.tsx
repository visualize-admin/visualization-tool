import * as React from "react";
import { Flex } from "theme-ui";
import { useLinesScale } from "./scales";
import { ChartProps } from "..";

export const Legend = React.memo(
  ({ data, fields }: Pick<ChartProps, "data" | "fields">) => {
    const { colors } = useLinesScale({ data, fields });

    return (
      <Flex
        sx={{
          position: "relative",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexWrap: "wrap",
          minHeight: "20px"
        }}
      >
        {colors.domain().map((item, i) => (
          <Flex
            key={i}
            sx={{
              position: "relative",
              mt: 1,
              mr: 4,
              justifyContent: "space-between",
              alignItems: "center",
              pl: 2,
              fontFamily: "body",
              lineHeight: [1, 2, 2],
              fontWeight: "regular",
              fontSize: [1, 2, 2],
              color: "monochrome700",

              "&::before": {
                content: "''",
                position: "relative",
                display: "block",
                left: -2,
                width: ".5rem",
                height: 2,
                bg: colors(item)
              }
            }}
          >
            {item}
          </Flex>
        ))}
      </Flex>
    );
  }
);
