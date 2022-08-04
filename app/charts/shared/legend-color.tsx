import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { memo, useMemo } from "react";

import {
  ColorsChartState,
  useChartState,
} from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import {
  ConfiguratorState,
  isConfiguring,
  isSegmentInConfig,
} from "@/configurator";
import {
  useDataCubeMetadataWithComponentValuesQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { dfs } from "@/lib/dfs";
import useEvent from "@/lib/use-event";
import { useConfiguratorState, useLocale } from "@/src";

type LegendSymbol = "square" | "line" | "circle";

const useStyles = makeStyles<Theme>(() => ({
  legendContainer: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexWrap: "wrap",
    minHeight: "20px",
    gap: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(4, auto)",
    gridAutoFlow: "row dense",
  },
  legendGroup: {},
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

type SegmentConfigState<T extends ConfiguratorState = ConfiguratorState> =
  T extends { chartConfig: { fields: { segment: any } } } ? T : never;

type S = SegmentConfigState<ConfiguratorState>;
// ^?

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
      {groups.map((group) => {
        return (
          <div key={group.value}>
            <Typography variant="h4">{group.label}</Typography>
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
          </div>
        );
      })}
    </Flex>
  );
};

const useLegendGroups = (labels: string[]) => {
  const [configState] = useConfiguratorState(isConfiguring);
  const segment = isSegmentInConfig(configState.chartConfig)
    ? configState.chartConfig.fields.segment
    : null;
  const locale = useLocale();
  const cubeIri = configState.dataSet;
  const [{ data: cubeMetadata }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: configState.dataSet,
      locale: locale,
    },
  });
  const segmentDimension = useMemo(() => {
    return cubeMetadata?.dataCubeByIri?.dimensions.find(
      (d) => d.iri === segment?.componentIri
    );
  }, [cubeMetadata?.dataCubeByIri?.dimensions, segment?.componentIri]);
  const [hierarchyResp] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: cubeIri,
      dimensionIri: segmentDimension?.iri!,
      locale: locale,
    },
    pause: !segmentDimension?.iri,
  });
  const hierarchy =
    hierarchyResp?.data?.dataCubeByIri?.dimensionByIri?.hierarchy;

  const groups = useMemo(() => {
    if (!hierarchy) {
      return new Map([[[], labels]]);
    }
    const labelSet = new Set(labels);
    const groups = new Map<HierarchyValue[], string[]>();
    [
      ...dfs(hierarchy, (node, { depth, parents }) => {
        if (!labelSet.has(node.label)) {
          return;
        }
        groups.set(parents, groups.get(parents) || []);
        groups.get(parents)?.push(node.label);
      }),
    ];
    return groups;
  }, [hierarchy, labels]);

  return groups;
};

export const LegendColor = memo(function LegendColor({
  symbol,
}: {
  symbol: LegendSymbol;
}) {
  // @ts-ignore
  const { colors, getSegmentLabel } = useChartState() as ColorsChartState;
  const groups = useLegendGroups(colors.domain());
  const classes = useStyles();
  return (
    <Flex className={classes.legendContainer}>
      {groups
        ? Array.from(groups.entries()).map(([g, colorValues]) => {
            return (
              <div
                className={classes.legendGroup}
                key={g.map((n) => n.label).join(" > ")}
              >
                <Typography variant="h5" gutterBottom>
                  {g.map((n) => n.label).join(" > ")}
                </Typography>
                {colorValues.map((item, i) => (
                  <LegendItem
                    key={i}
                    item={getSegmentLabel(item)}
                    color={colors(item)}
                    symbol={symbol}
                  />
                ))}
              </div>
            );
          })
        : null}
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
