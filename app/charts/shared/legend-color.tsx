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
import { Checkbox, CheckboxProps } from "@/components/form";
import {
  DataSource,
  GenericSegmentField,
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

const useStyles = makeStyles<Theme>((theme) => ({
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
    "& $legendGroup": {
      flexDirection: "row",
    },
  },
  legendGroup: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "1rem",
    flexDirection: "column",
  },
  groupHeader: {
    marginBottom: theme.spacing(1),
    flexWrap: "wrap",
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

  legendCheckbox: {
    marginTop: () => "0.25rem",
  },
}));

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
  title,
  labels,
  getLabel,
}: {
  title?: string;
  labels: string[];
  getLabel: (d: string) => string;
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
  const segmentField = (
    isSegmentInConfig(configState.chartConfig)
      ? configState.chartConfig.fields.segment
      : null
  ) as GenericSegmentField | null | undefined;

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
      getLabel,
      hierarchy,
      sort: !!(segmentField && "sorting" in segmentField),
      useAbbreviations: segmentField?.useAbbreviations ?? false,
    });
  }, [title, labels, getLabel, hierarchy, segmentField]);

  return groups;
};

export const LegendColor = memo(function LegendColor({
  symbol,
  interactive,
}: {
  symbol: LegendSymbol;
  interactive?: boolean;
}) {
  const { colors, getSegmentLabel } = useChartState() as ColorsChartState;
  const groups = useLegendGroups({
    labels: colors.domain(),
    getLabel: getSegmentLabel,
  });

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => colors(v)}
      getLabel={getSegmentLabel}
      symbol={symbol}
      interactive={interactive}
    />
  );
});

// TODO: add metadata to legend titles?
export const MapLegendColor = memo(function LegendColor({
  component,
  getColor,
  useAbbreviations,
}: {
  component: DimensionMetadataFragment;
  getColor: (d: Observation) => number[];
  useAbbreviations: boolean;
}) {
  const sortedValues = component.values.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const getLabel = useAbbreviations
    ? (d: string) => {
        const v = component.values.find((v) => v.value === d);
        return (v?.alternateName || v?.label) as string;
      }
    : (d: string) => {
        return component.values.find((v) => v.value === d)?.label as string;
      };
  const groups = useLegendGroups({
    labels: sortedValues.map((d) => `${d.value}`),
    getLabel,
    title: component.label,
  });

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
  interactive,
}: {
  groups: ReturnType<typeof useLegendGroups>;
  getColor: (d: string) => string;
  getLabel: (d: string) => string;
  symbol: LegendSymbol;
  interactive?: boolean;
}) => {
  const classes = useStyles();
  const [state, dispatch] = useInteractiveFilters();
  const { categories } = state;

  const activeInteractiveFilters = useMemo(() => {
    return new Set(Object.keys(categories));
  }, [categories]);

  const handleToggle: CheckboxProps["onChange"] = useEvent((ev) => {
    const item = ev.target.value;

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
            let chevronKey = 0;
            return (
              <div
                className={classes.legendGroup}
                key={g.map((n) => n.label).join(" > ")}
                data-testid="colorLegend"
              >
                {headerLabelsArray.length > 0 ? (
                  <Typography
                    variant="h5"
                    display="flex"
                    alignItems="center"
                    className={classes.groupHeader}
                  >
                    {interlace(
                      g.map((n) => n.label),
                      <SvgIcChevronRight key={chevronKey++} />
                    )}
                  </Typography>
                ) : null}
                {colorValues.map((d, i) => (
                  <LegendItem
                    key={`${d}_${i}`}
                    item={getLabel(d)}
                    color={getColor(d)}
                    symbol={symbol}
                    interactive={interactive}
                    onToggle={handleToggle}
                    checked={
                      interactive && !activeInteractiveFilters.has(getLabel(d))
                    }
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
  interactive,
  onToggle,
  checked,
}: {
  item: string;
  color: string;
  symbol: LegendSymbol;
  interactive?: boolean;
  onToggle?: CheckboxProps["onChange"];
  checked?: boolean;
}) => {
  const classes = useItemStyles({ symbol, color });
  return (
    <>
      {interactive && onToggle ? (
        <Checkbox
          label={item}
          name={item}
          value={item}
          checked={checked !== undefined ? checked : true}
          onChange={onToggle}
          key={item}
          color={color}
          className={classes.legendCheckbox}
        />
      ) : (
        <Flex data-testid="legendItem" className={classes.legendItem}>
          {item}
        </Flex>
      )}
    </>
  );
};
