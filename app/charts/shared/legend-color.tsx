import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { memo, useMemo } from "react";

import {
  ColorsChartState,
  useChartState,
} from "@/charts/shared/use-chart-state";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import {
  DataSource,
  isSegmentInConfig,
  useReadOnlyConfiguratorState,
} from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeMetadataWithComponentValuesQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useLocale } from "@/src";
import { interlace } from "@/utils/interlace";
import useEvent from "@/utils/use-event";

import { rgbArrayToHex } from "./colors";
import { getLegendGroups } from "./legend-color-helpers";

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
  legendContainerNoGroups: {
    gridTemplateColumns: "1fr",
  },
  legendGroup: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "1rem",
  },
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
    <Flex
      className={clsx(
        classes.legendContainer,
        groups.length === 1 ? classes.legendContainerNoGroups : undefined
      )}
    >
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

const useDimension = ({
  dataset,
  dataSource,
  locale,
  dimensionIri,
}: {
  dataset: string;
  dataSource: DataSource;
  locale: string;
  dimensionIri?: string;
}) => {
  const [{ data: cubeMetadata }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataset,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale: locale,
    },
    pause: !dimensionIri,
  });
  return useMemo(() => {
    return cubeMetadata?.dataCubeByIri?.dimensions.find(
      (d) => d.iri === dimensionIri
    );
  }, [cubeMetadata?.dataCubeByIri?.dimensions, dimensionIri]);
};

const useLegendGroups = ({
  labels,
  title,
}: {
  labels: string[];
  title?: string;
}) => {
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

  // FIXME: should color field also be included here?
  const segmentField = isSegmentInConfig(configState.chartConfig)
    ? configState.chartConfig.fields.segment
    : null;

  const { dataSet: dataset, dataSource } = configState;
  const segmentDimension = useDimension({
    dataset,
    dataSource: dataSource,
    locale: locale,
    dimensionIri: segmentField?.componentIri,
  });

  const [hierarchyResp] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: dataset,
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
    return getLegendGroups({
      title,
      labels,
      hierarchy,
      sort: !!(segmentField && "sorting" in segmentField),
    });
  }, [title, labels, hierarchy, segmentField]);

  return groups;
};

export const LegendColor = memo(function LegendColor({
  symbol,
}: {
  symbol: LegendSymbol;
}) {
  const { colors, getSegmentLabel } = useChartState() as ColorsChartState;
  const groups = useLegendGroups({ labels: colors.domain() });

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => colors(v)}
      getLabel={getSegmentLabel}
      symbol={symbol}
    />
  );
});

// TODO: add metadata to legend titles?
export const MapLegendColor = memo(function LegendColor({
  component,
  getColor,
}: {
  component: DimensionMetadataFragment;
  getColor: (d: Observation) => number[];
}) {
  const sortedValues = component.values.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const groups = useLegendGroups({
    labels: sortedValues.map((d) => d.value),
    title: component.label,
  });
  const getLabel = (d: string) => {
    return component.values.find((v) => v.value === d).label as string;
  };

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => {
        const label = getLabel(v);
        const rgb = getColor({ [component.iri]: label });
        return rgbArrayToHex(rgb);
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
    <Flex
      className={clsx(
        classes.legendContainer,
        groups.length === 1 ? classes.legendContainerNoGroups : undefined
      )}
    >
      {groups
        ? groups.map(([g, colorValues]) => {
            const headerLabelsArray = g.map((n) => n.label);

            return (
              <div
                className={classes.legendGroup}
                key={g.map((n) => n.label).join(" > ")}
                data-testid="colorLegend"
              >
                {headerLabelsArray.length > 0 ? (
                  <Typography variant="h5" display="flex" alignItems="center">
                    {interlace(
                      g.map((n) => n.label),
                      <SvgIcChevronRight />
                    )}
                  </Typography>
                ) : null}
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
  return (
    <Flex data-testid="legendItem" className={classes.legendItem}>
      {item}
    </Flex>
  );
};
