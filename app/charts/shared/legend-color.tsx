import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { memo, useMemo } from "react";

import {
  ColorsChartState,
  useChartState,
} from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import useEvent from "@/lib/use-event";

type LegendSymbol = "square" | "line" | "circle";

const useStyles = makeStyles<Theme>(() => ({
  legendContainer: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexWrap: "wrap",
    minHeight: "20px",
    gap: "0 1.5rem",
  },
}));

const useItemStyles = makeStyles<
  Theme,
  { symbol: LegendSymbol; color: string }
>((theme) => ({
  legendItem: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.grey[700],
    fontSize: theme.typography.body2.fontSize,

    "&::before": {
      content: "''",
      position: "relative",
      display: "block",
      width: ".5rem",
      marginRight: "0.5rem",
      backgroundColor: ({ color }) => color,
      height: ({ symbol }) =>
        symbol === "square" || symbol === "circle" ? `.5rem` : 2,
      borderRadius: ({ symbol }) => (symbol === "circle" ? "50%" : 0),
    },
  },
}));

export const InteractiveLegendColor = () => {
  const [state, dispatch] = useInteractiveFilters();
  const { categories } = state;
  const activeInteractiveFilters = useMemo(() => {
    return new Set(Object.keys(categories));
  }, [categories]);

  const { colors } = useChartState() as ColorsChartState;

  const setFilter = useEvent((item: string) => {
    if (activeInteractiveFilters.has(item)) {
      dispatch({
        type: "REMOVE_INTERACTIVE_FILTER",
        value: item,
      });
    } else {
      dispatch({
        type: "ADD_INTERACTIVE_FILTER",
        value: item,
      });
    }
  });

  const groups = useMemo(() => {
    return [{ label: undefined, value: "", values: colors.domain() }];
  }, [colors]);
  const classes = useStyles();
  return (
    <Flex className={classes.legendContainer}>
      {colors.domain().map((item, i) => (
        <Checkbox
          label={item}
          name={item}
          value={item}
          checked={!activeInteractiveFilters.has(item)}
          onChange={() => setFilter(item)}
          key={i}
          color={colors(item)}
        />
      ))}
    </Flex>
  );
};

export const LegendColor = memo(function LegendColor({
  symbol,
}: {
  symbol: LegendSymbol;
}) {
  // @ts-ignore
  const { colors, getSegmentLabel } = useChartState() as ColorsChartState;
  const classes = useStyles();
  return (
    <Flex className={classes.legendContainer}>
      {colors.domain().map((item, i) => (
        <LegendItem
          key={i}
          item={getSegmentLabel(item)}
          color={colors(item)}
          symbol={symbol}
        />
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
}) => {
  const classes = useItemStyles({ symbol, color });
  return <Flex className={classes.legendItem}>{item}</Flex>;
};
