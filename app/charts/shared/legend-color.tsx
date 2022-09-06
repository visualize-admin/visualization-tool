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
  isSegmentInConfig,
  useReadOnlyConfiguratorState,
} from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeMetadataWithComponentValuesQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useLocale } from "@/src";
import { dfs } from "@/utils/dfs";
import { interlace } from "@/utils/interlace";
import useEvent from "@/utils/use-event";

import { convertRgbArrayToHex } from "./colors";

type LegendSymbol = "square" | "line" | "circle";

const useStyles = makeStyles<Theme>(() => ({
  legendContainer: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexWrap: "wrap",
    minHeight: "20px",
    gap: "1rem 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    alignItems: "flex-start",
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.grey[700],
    fontSize: theme.typography.body2.fontSize,

    "&::before": {
      content: "''",
      position: "relative",
      display: "block",
      width: ".5rem",
      marginTop: ({ symbol }) => (symbol === "line" ? "0.75rem" : "0.5rem"),
      marginRight: "0.5rem",
      flexShrink: 0,
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
      {groups.map((group) => {
        return (
          <div key={group.value}>
            {group.label ? (
              <Typography variant="h4">{group.label}</Typography>
            ) : null}
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
  const configState = useReadOnlyConfiguratorState();

  if (
    configState.state === "INITIAL" ||
    configState.state === "SELECTING_DATASET"
  ) {
    throw new Error(
      `Cannot call useLegendGroups from state ${configState.state}`
    );
  }

  const locale = useLocale();
  const segment = isSegmentInConfig(configState.chartConfig)
    ? configState.chartConfig.fields.segment
    : null;
  const { dataSet, dataSource } = configState;
  const [{ data: cubeMetadata }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
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
      cubeIri: dataSet,
      dimensionIri: segmentDimension?.iri!,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
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
      ...dfs(hierarchy, (node, { parents }) => {
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

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => colors(v)}
      getLabel={getSegmentLabel}
      symbol={symbol}
    />
  );
});

export const MapLegendColor = memo(function LegendColor({
  component: { iri, values },
  getColor,
}: {
  component: DimensionMetadataFragment;
  getColor: (d: Observation) => number[];
}) {
  const sortedValues = values.sort((a, b) => a.label.localeCompare(b.label));
  const groups = useLegendGroups(sortedValues.map((d) => d.value));
  const getLabel = (d: string) => {
    return values.find((v) => v.value === d).label as string;
  };

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => {
        const label = getLabel(v);
        const rgb = getColor({ [iri]: label });
        const hex = convertRgbArrayToHex(rgb);

        return hex;
      }}
      getLabel={getLabel}
      symbol="circle"
    />
  );
});

const LegendColorContent = ({
  groups,
  getColor,
  getLabel,
  symbol,
}: {
  groups: ReturnType<typeof useLegendGroups>;
  getColor: (d: string) => string;
  getLabel: (d: string) => string;
  symbol: LegendSymbol;
}) => {
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
                <Typography
                  variant="h5"
                  gutterBottom
                  display="flex"
                  alignItems="center"
                >
                  {interlace(
                    g.map((n) => n.label),
                    <SvgIcChevronRight />
                  )}
                </Typography>
                {colorValues.map((d) => (
                  <LegendItem
                    key={d}
                    item={getLabel(d)}
                    color={getColor(d)}
                    symbol={symbol}
                  />
                ))}
              </div>
            );
          })
        : null}
    </Flex>
  );
};

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
