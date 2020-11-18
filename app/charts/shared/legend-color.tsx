import React, { memo } from "react";
import { Flex } from "theme-ui";
import { Checkbox } from "../../components/form";
import { AreasState } from "../area/areas-state";
import { GroupedBarsState } from "../bar/bars-grouped-state";
import { BarsState } from "../bar/bars-state";
import { GroupedColumnsState } from "../column/columns-grouped-state";
import { StackedColumnsState } from "../column/columns-stacked-state";
import { ColumnsState } from "../column/columns-state";
import { LinesState } from "../line/lines-state";
import { PieState } from "../pie/pie-state";
import { ScatterplotState } from "../scatterplot/scatterplot-state";
import { useChartState } from "./use-chart-state";
import { useInteractiveFilters } from "./use-interactive-filters";

type LegendSymbol = "square" | "line" | "circle";

export const InteractiveLegendColor = ({
  symbol,
}: {
  symbol: LegendSymbol;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const activeInteractiveFilters = Object.keys(state);
  const { colors } = useChartState() as
    | BarsState
    | GroupedBarsState
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState
    | LinesState
    | AreasState
    | ScatterplotState
    | PieState;

  const setFilter = (segment: string) => {
    if (activeInteractiveFilters.includes(segment)) {
      dispatch({
        type: "REMOVE_INTERACTIVE_FILTER",
        value: { segment },
      });
    } else {
      dispatch({
        type: "ADD_INTERACTIVE_FILTER",
        value: { segment },
      });
    }
  };
  return (
    <Flex
      sx={{
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexWrap: "wrap",
        minHeight: "20px",
      }}
    >
      {colors.domain().map((item, i) => (
        <Checkbox
          label={item}
          name={item}
          value={item}
          checked={!activeInteractiveFilters.includes(item)}
          onChange={() => setFilter(item)}
          key={i}
          color={colors(item)}
        />
      ))}
    </Flex>
  );
};

export const LegendColor = memo(({ symbol }: { symbol: LegendSymbol }) => {
  const { colors } = useChartState() as
    | BarsState
    | GroupedBarsState
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState
    | LinesState
    | AreasState
    | ScatterplotState
    | PieState;

  return (
    <Flex
      sx={{
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexWrap: "wrap",
        minHeight: "20px",
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
  symbol,
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
        bg: color,
      },
    }}
  >
    {item}
  </Flex>
);
