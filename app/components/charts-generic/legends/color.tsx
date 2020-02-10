import * as React from "react";
import { memo } from "react";
import { Flex } from "theme-ui";
import { useChartState } from "../use-chart-state";

type LegendSymbol = "square" | "line" | "circle";

export const LegendColor = memo(({ symbol }: { symbol: LegendSymbol }) => {
  const { colors } = useChartState();

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
        <LegendItem key={i} item={item} color={colors(item)} symbol={symbol} />
      ))}
    </Flex>
  );
});

export const LegendItem = ({
  item,
  color,
  symbol
}: {
  item: string;
  color: string;
  symbol: LegendSymbol;
}) => (
  <Flex
    sx={{
      position: "relative",
      mt: 1,
      mr: 4,
      justifyContent: "flex-start",
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
        height: symbol === "square" || symbol === "circle" ? `.5rem` : 2,
        borderRadius: symbol === "circle" ? "50%" : 0,
        bg: color
      }
    }}
  >
    {item}
  </Flex>
);
