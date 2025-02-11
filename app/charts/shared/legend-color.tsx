import { t } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import orderBy from "lodash/orderBy";
import { memo, useCallback, useMemo } from "react";

import { ColorsChartState, useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { getLegendGroups } from "@/charts/shared/legend-color-helpers";
import Flex from "@/components/flex";
import { Checkbox, CheckboxProps } from "@/components/form";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { TooltipTitle } from "@/components/tooltip-utils";
import { useChartConfigFilters } from "@/config-utils";
import {
  ChartConfig,
  GenericField,
  isSegmentInConfig,
  MapConfig,
  useReadOnlyConfiguratorState,
} from "@/configurator";
import {
  Component,
  Dimension,
  isOrdinalDimension,
  isOrdinalMeasure,
  Measure,
  Observation,
} from "@/domain/data";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { interlace } from "@/utils/interlace";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

export type LegendSymbol = "square" | "line" | "circle";

type LegendItemUsage = "legend" | "tooltip" | "colorPicker";

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

type ItemStyleProps = {
  symbol: LegendSymbol;
  color: string;
  usage: LegendItemUsage;
};

const useItemStyles = makeStyles<Theme, ItemStyleProps>((theme) => {
  return {
    legendItem: {
      position: "relative",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      fontSize: ({ usage }) =>
        ["legend", "colorPicker"].includes(usage)
          ? theme.typography.body2.fontSize
          : theme.typography.caption.fontSize,
      fontWeight: theme.typography.fontWeightRegular,
      color: theme.palette.grey[700],

      "&::before": {
        content: "''",
        position: "relative",
        display: "block",
        width: `calc(0.5rem * var(--size-adjust, 1))`,
        height: ({ symbol }) =>
          `calc(${["square", "circle"].includes(symbol) ? "0.5rem" : "2px"} * var(--size-adjust, 1))`,
        marginTop: ({ symbol, usage }) =>
          `calc(0.75rem - calc(${
            ["square", "circle"].includes(symbol)
              ? usage === "tooltip"
                ? "0.6rem"
                : "0.5rem"
              : usage === "tooltip"
                ? "0.2rem"
                : "2px"
          } * var(--size-adjust, 1)) * 0.5)`,
        marginRight: "0.4rem",
        flexShrink: 0,
        backgroundColor: ({ color }) => color,
        borderRadius: ({ symbol }) => (symbol === "circle" ? "50%" : 0),
      },
    },

    legendCheckbox: {
      marginBottom: () => "0.25rem",
      marginRight: 0,
    },
    bigger: {
      "--size-adjust": 1.5,
    },
  };
});

const emptyObj = {};

const useLegendGroups = ({
  chartConfig,
  segmentDimension,
  title,
  values,
}: {
  chartConfig: ChartConfig;
  segmentDimension?: Dimension;
  title?: string;
  values: string[];
}) => {
  const configState = useReadOnlyConfiguratorState();
  const filters = useChartConfigFilters(chartConfig);

  if (
    configState.state === "INITIAL" ||
    configState.state === "SELECTING_DATASET"
  ) {
    throw Error(`Cannot call useLegendGroups from state ${configState.state}`);
  }

  const segmentField = (
    isSegmentInConfig(chartConfig) ? chartConfig.fields.segment : null
  ) as GenericField | null | undefined;
  const segmentFilters = segmentField?.componentId
    ? filters[segmentField.componentId]
    : null;
  const segmentValues =
    segmentFilters?.type === "multi" ? segmentFilters.values : emptyObj;

  return useMemo(() => {
    return getLegendGroups({
      title,
      values,
      hierarchy: segmentDimension?.hierarchy,
      sort: !!(segmentField && "sorting" in segmentField),
      labelIris: segmentValues,
    });
  }, [title, values, segmentDimension?.hierarchy, segmentField, segmentValues]);
};

type LegendColorProps = {
  chartConfig: ChartConfig;
  segmentDimension?: Dimension;
  symbol: LegendSymbol;
  // If the legend is based on measures, this function can be used to get the
  // corresponding measure to open the metadata panel.
  getLegendItemDimension?: (dimensionLabel: string) => Measure | undefined;
  interactive?: boolean;
  showTitle?: boolean;
};

export const LegendColor = memo(function LegendColor(props: LegendColorProps) {
  const {
    chartConfig,
    segmentDimension,
    symbol,
    getLegendItemDimension,
    interactive,
    showTitle,
  } = props;
  const { colors, getColorLabel } = useChartState() as ColorsChartState;
  const values = colors.domain();
  const groups = useLegendGroups({ chartConfig, segmentDimension, values });

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => colors(v)}
      getLabel={getColorLabel}
      getItemDimension={getLegendItemDimension}
      symbol={symbol}
      showTitle={showTitle}
      interactive={interactive}
      numberOfOptions={values.length}
    />
  );
});

const removeOpacity = (rgb: number[]) => rgb.slice(0, 3);

type MapLegendColorProps = {
  component: Component;
  getColor: (d: Observation) => number[];
  useAbbreviations: boolean;
  chartConfig: MapConfig;
  observations: Observation[];
};

export const MapLegendColor = memo(function LegendColor(
  props: MapLegendColorProps
) {
  const { component, getColor, useAbbreviations, chartConfig, observations } =
    props;
  const filters = useChartConfigFilters(chartConfig);
  const dimensionFilter = filters[component.id];
  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(component, {
      sorting: { sortingType: "byAuto", sortingOrder: "asc" },
      dimensionFilter,
    });
    return orderBy(
      component.values,
      sorters.map((s) => (d) => s(d.label))
    );
  }, [component, dimensionFilter]);
  const getLabel = useCallback(
    (d: string) => {
      if (useAbbreviations) {
        const v = component.values.find((v) => v.value === d);
        return (v?.alternateName || v?.label) as string;
      } else {
        return component.values.find((v) => v.value === d)?.label as string;
      }
    },
    [component, useAbbreviations]
  );
  const legendValues = useMemo(() => {
    const observationLabels = new Set(observations.map((o) => o[component.id]));
    const sortedStringValues = sortedValues.map((d) => `${d.value}`);
    // If the component is a measure or an ordinal dimension, we want to show all
    // values for comparison purposes
    return isOrdinalDimension(component) || isOrdinalMeasure(component)
      ? sortedStringValues
      : sortedStringValues.filter((v) => observationLabels.has(getLabel(v)));
  }, [observations, sortedValues, component, getLabel]);
  const groups = useLegendGroups({
    chartConfig,
    title: component.label,
    values: legendValues,
  });

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => {
        const label = getLabel(v);
        const rgb = getColor({ [component.id]: label });
        return rgbArrayToHex(removeOpacity(rgb));
      }}
      getLabel={getLabel}
      symbol="circle"
      showTitle
      numberOfOptions={sortedValues.length}
    />
  );
});

type LegendColorContentProps = {
  groups: ReturnType<typeof useLegendGroups>;
  getColor: (d: string) => string;
  getLabel: (d: string) => string;
  getItemDimension?: (dimensionLabel: string) => Measure | undefined;
  symbol: LegendSymbol;
  interactive?: boolean;
  numberOfOptions: number;
  showTitle?: boolean;
};

const LegendColorContent = (props: LegendColorContentProps) => {
  const {
    groups,
    getColor,
    getLabel,
    getItemDimension,
    symbol,
    interactive,
    numberOfOptions,
    showTitle,
  } = props;
  const classes = useStyles();
  const categories = useChartInteractiveFilters((d) => d.categories);
  const addCategory = useChartInteractiveFilters((d) => d.addCategory);
  const removeCategory = useChartInteractiveFilters((d) => d.removeCategory);
  const activeInteractiveFilters = useMemo(() => {
    return new Set(Object.keys(categories));
  }, [categories]);

  const soleItemChecked = activeInteractiveFilters.size === numberOfOptions - 1;

  const handleToggle: CheckboxProps["onChange"] = useEvent((ev) => {
    const disabled = soleItemChecked && !ev.target.checked;
    const item = ev.target.value;

    if (activeInteractiveFilters.has(item)) {
      removeCategory(item);
    } else if (!disabled) {
      addCategory(item);
    }
  });

  return (
    <Flex
      className={clsx(
        classes.legendContainer,
        groups.length === 1 && classes.legendContainerNoGroups
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
                  <Typography
                    variant="h5"
                    display="flex"
                    alignItems="center"
                    className={classes.groupHeader}
                  >
                    {interlace(
                      g.map((n) => n.label),
                      (chevronKey) => (
                        <SvgIcChevronRight key={chevronKey} />
                      )
                    )}
                  </Typography>
                ) : null}
                {colorValues.map((d, i) => {
                  const label = getLabel(d);
                  const active = !activeInteractiveFilters.has(label);

                  return (
                    <LegendItem
                      key={`${d}_${i}`}
                      data-testId={`legend-title-${showTitle ? "visible" : "hidden"}`}
                      item={showTitle ? label : ""}
                      color={getColor(d)}
                      dimension={getItemDimension?.(label)}
                      symbol={symbol}
                      interactive={interactive}
                      onToggle={handleToggle}
                      checked={interactive && active}
                      disabled={soleItemChecked && active}
                    />
                  );
                })}
              </div>
            );
          })
        : null}
    </Flex>
  );
};

type LegendItemProps = {
  item: string;
  color: string;
  dimension?: Measure;
  symbol: LegendSymbol;
  interactive?: boolean;
  onToggle?: CheckboxProps["onChange"];
  checked?: boolean;
  disabled?: boolean;
  usage?: LegendItemUsage;
};

export const LegendItem = (props: LegendItemProps) => {
  const {
    item,
    color,
    dimension,
    symbol,
    interactive,
    onToggle,
    checked,
    disabled,
    usage = "legend",
  } = props;
  const classes = useItemStyles({ symbol, color, usage });
  const shouldBeBigger = symbol === "circle" || usage === "colorPicker";

  return interactive && onToggle ? (
    <MaybeTooltip
      title={
        disabled ? (
          <TooltipTitle
            text={t({
              id: "controls.filters.interactive.color.min-1-filter",
              message: "At least one filter must be selected.",
            })}
          />
        ) : undefined
      }
    >
      <div>
        <Checkbox
          label={item}
          name={item}
          value={item}
          checked={checked !== undefined ? checked : true}
          onChange={onToggle}
          key={item}
          color={color}
          className={clsx(
            classes.legendCheckbox,
            shouldBeBigger && classes.bigger
          )}
        />
      </div>
    </MaybeTooltip>
  ) : (
    <Flex
      data-testid="legendItem"
      className={clsx(classes.legendItem, shouldBeBigger && classes.bigger)}
    >
      {dimension ? (
        <OpenMetadataPanelWrapper component={dimension}>
          {/* Account for the added space, to align the symbol and label. */}
          <span style={{ marginTop: 3 }}>{item}</span>
        </OpenMetadataPanelWrapper>
      ) : (
        item
      )}
    </Flex>
  );
};
