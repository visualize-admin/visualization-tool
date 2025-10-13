import { t } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import orderBy from "lodash/orderBy";
import { memo, useCallback, useMemo } from "react";

import { ColorsChartState, useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { getLegendGroups } from "@/charts/shared/legend-color-helpers";
import { Flex } from "@/components/flex";
import { Checkbox, CheckboxProps } from "@/components/form";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useChartConfigFilters, useLimits } from "@/config-utils";
import {
  AreaConfig,
  BarConfig,
  ChartConfig,
  ColumnConfig,
  GenericField,
  isSegmentInConfig,
  LineConfig,
  MapConfig,
  PieConfig,
  ScatterPlotConfig,
  useReadOnlyConfiguratorState,
} from "@/configurator";
import {
  Component,
  isOrdinalDimension,
  isOrdinalMeasure,
  Measure,
  Observation,
} from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { interlace } from "@/utils/interlace";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import { useEvent } from "@/utils/use-event";

import { DimensionsById } from "./chart-props";

export type LegendSymbol =
  | "square"
  | "line"
  | "dashed-line"
  | "circle"
  | "cross"
  | "triangle";

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
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(2),
    flexDirection: "column",
  },
  groupHeader: {
    marginBottom: theme.spacing(1),
    flexWrap: "wrap",
  },
}));

const useLegendGroups = ({
  chartConfig,
  title,
  values,
}: {
  chartConfig: ChartConfig;
  title?: string;
  values: string[];
}) => {
  const configState = useReadOnlyConfiguratorState();

  if (
    configState.state === "INITIAL" ||
    configState.state === "SELECTING_DATASET"
  ) {
    throw Error(`Cannot call useLegendGroups from state ${configState.state}`);
  }

  const segmentField = (
    isSegmentInConfig(chartConfig) ? chartConfig.fields.segment : null
  ) as GenericField | null | undefined;

  return useMemo(() => {
    return getLegendGroups({
      title,
      values,
      sort: !!(segmentField && "sorting" in segmentField),
    });
  }, [title, values, segmentField]);
};

export const LegendColor = memo(function LegendColor({
  chartConfig,
  symbol,
  getLegendItemDimension,
  interactive,
  showTitle,
  dimensionsById,
  limits,
}: {
  chartConfig:
    | AreaConfig
    | BarConfig
    | ColumnConfig
    | LineConfig
    | PieConfig
    | ScatterPlotConfig;
  symbol: LegendSymbol;
  /** If the legend is based on measures, this function can be used to get the
   * corresponding measure to open the metadata panel.
   **/
  getLegendItemDimension?: (dimensionLabel: string) => Measure | undefined;
  interactive?: boolean;
  showTitle?: boolean;
  dimensionsById?: DimensionsById;
  limits?: ReturnType<typeof useLimits>;
}) {
  const { colors, getColorLabel } = useChartState() as ColorsChartState;
  const values =
    chartConfig.fields.color.type === "segment" ? colors.domain() : [];
  const groups = useLegendGroups({ chartConfig, values });
  const segmentComponent =
    isSegmentInConfig(chartConfig) &&
    chartConfig.fields.segment &&
    dimensionsById
      ? dimensionsById[chartConfig.fields.segment.componentId]
      : null;

  return (
    <div>
      {showTitle && segmentComponent && (
        <OpenMetadataPanelWrapper component={segmentComponent}>
          <Typography
            data-testid="legendTitle"
            component="div"
            variant="caption"
          >
            {segmentComponent.label}
          </Typography>
        </OpenMetadataPanelWrapper>
      )}
      <LegendColorContent
        groups={groups}
        limits={limits?.limits.map(
          ({ configLimit, measureLimit, limitUnit }) => {
            let values: number[] = [];

            switch (measureLimit.type) {
              case "single":
                values = [measureLimit.value];
                break;
              case "value-range":
                values = [measureLimit.min, measureLimit.max];
                break;
              case "time-range":
                values = [measureLimit.value];
                break;
              default:
                const _exhaustiveCheck: never = measureLimit;
                return _exhaustiveCheck;
            }

            return {
              label: measureLimit.name,
              values,
              color: configLimit.color,
              symbol: !configLimit.symbolType
                ? configLimit.lineType === "dashed"
                  ? "dashed-line"
                  : "line"
                : configLimit.symbolType,
              unit: limitUnit,
            };
          }
        )}
        getColor={colors}
        getLabel={getColorLabel}
        getItemDimension={getLegendItemDimension}
        symbol={symbol}
        interactive={interactive}
        numberOfOptions={values.length}
      />
    </div>
  );
});

const removeOpacity = (rgb: number[]) => rgb.slice(0, 3);

export const MapLegendColor = memo(function LegendColor({
  component,
  getColor,
  useAbbreviations,
  chartConfig,
  observations,
}: {
  component: Component;
  getColor: (d: Observation) => number[];
  useAbbreviations: boolean;
  chartConfig: MapConfig;
  observations: Observation[];
}) {
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
      numberOfOptions={sortedValues.length}
    />
  );
});

const LegendColorContent = ({
  groups,
  limits,
  getColor,
  getLabel,
  getItemDimension,
  symbol,
  interactive,
  numberOfOptions,
}: {
  groups: ReturnType<typeof useLegendGroups>;
  limits?: {
    label: string;
    values: number[];
    color: string;
    symbol: LegendSymbol;
    unit?: string;
  }[];
  getColor: (d: string) => string;
  getLabel: (d: string) => string;
  getItemDimension?: (dimensionLabel: string) => Measure | undefined;
  symbol: LegendSymbol;
  interactive?: boolean;
  numberOfOptions: number;
}) => {
  const classes = useStyles();
  const categories = useChartInteractiveFilters((d) => d.categories);
  const addCategory = useChartInteractiveFilters((d) => d.addCategory);
  const removeCategory = useChartInteractiveFilters((d) => d.removeCategory);
  const activeInteractiveFilters = useMemo(() => {
    return new Set(Object.keys(categories));
  }, [categories]);

  const soleItemChecked = activeInteractiveFilters.size === numberOfOptions - 1;

  const handleToggle: CheckboxProps["onChange"] = useEvent((e) => {
    const disabled = soleItemChecked && !e.target.checked;
    const item = e.target.value;

    if (activeInteractiveFilters.has(item)) {
      removeCategory(item);
    } else if (!disabled) {
      addCategory(item);
    }
  });

  const formatNumber = useFormatNumber({ decimals: "auto" });

  return (
    <Flex
      className={clsx(
        classes.legendContainer,
        groups.length === 1 && classes.legendContainerNoGroups
      )}
    >
      {groups
        ? groups.map(([g, colorValues], i) => {
            const key = g.map((n) => n.label).join(" > ");
            const isLastGroup = i === groups.length - 1;
            const headerLabelsArray = g.map((d) => d.label);

            return (
              <div
                key={key}
                className={classes.legendGroup}
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
                {colorValues.map((value, i) => {
                  const key = `${value}-${i}`;
                  const label = getLabel(value);
                  const active = !activeInteractiveFilters.has(label);

                  return (
                    <LegendItem
                      key={key}
                      label={label}
                      color={getColor(value)}
                      dimension={getItemDimension?.(label)}
                      symbol={symbol}
                      interactive={interactive}
                      onToggle={handleToggle}
                      checked={interactive && active}
                      disabled={soleItemChecked && active}
                    />
                  );
                })}
                {isLastGroup && limits
                  ? limits.map(({ label, values, color, symbol, unit }, i) => (
                      <LegendItem
                        key={i}
                        label={`${label}: ${values.map(formatNumber).join("-")}${unit ? ` ${unit}` : ""}`}
                        color={color}
                        symbol={symbol}
                      />
                    ))
                  : null}
              </div>
            );
          })
        : null}
    </Flex>
  );
};

const LegendIcon = ({
  symbol,
  size,
  fill,
}: {
  symbol: LegendSymbol;
  size: number;
  fill: string;
}) => {
  let node: JSX.Element;

  switch (symbol) {
    case "circle":
      node = <circle cx={0.5} cy={0.5} r={0.5} fill={fill} />;
      break;
    case "square":
      node = <rect width={1} height={1} fill={fill} />;
      break;
    case "cross":
      node = (
        <g fill={fill} transform="translate(0 0.05) rotate(45 0.5 0.5)">
          <rect x={0.45} y={0} width={0.1} height={1} />
          <rect x={0} y={0.45} width={1} height={0.1} />
        </g>
      );
      break;
    case "line":
      node = (
        <line
          x1={0}
          x2={1}
          y1={0.5}
          y2={0.5}
          stroke={fill}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      );
      break;
    case "dashed-line":
      node = (
        <line
          x1={0}
          x2={1}
          y1={0.5}
          y2={0.5}
          stroke={fill}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeDashoffset="3"
          strokeDasharray="2 2"
        />
      );
      break;
    case "triangle":
      node = (
        <polygon
          points="0.5,0.1339746 0.0669873,0.8660254 0.9330127,0.8660254"
          transform="translate(0 0.05)"
          fill={fill}
        />
      );
      break;
    default:
      const _exhaustiveCheck: never = symbol;
      return _exhaustiveCheck;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1 1"
      style={{ minWidth: size, minHeight: size }}
    >
      {node}
    </svg>
  );
};

export const LegendItem = ({
  label,
  color,
  dimension,
  symbol,
  interactive,
  onToggle,
  checked,
  disabled,
  smaller,
}: {
  label: string;
  color: string;
  dimension?: Measure;
  symbol: LegendSymbol;
  interactive?: boolean;
  onToggle?: CheckboxProps["onChange"];
  checked?: boolean;
  disabled?: boolean;
  smaller?: boolean;
}) => {
  const labelNode = (
    <Typography
      variant={smaller ? "caption" : "body3"}
      style={{ wordBreak: "break-word" }}
    >
      {label}
    </Typography>
  );

  return interactive && onToggle ? (
    <MaybeTooltip
      title={
        disabled
          ? t({
              id: "controls.filters.interactive.color.min-1-filter",
              message: "At least one filter must be selected.",
            })
          : undefined
      }
    >
      <div>
        <Checkbox
          name={label}
          label={label}
          value={label}
          checked={checked ?? true}
          onChange={onToggle}
          color={color}
          size={smaller ? "sm" : "md"}
        />
      </div>
    </MaybeTooltip>
  ) : (
    <Flex
      data-testid="legendItem"
      sx={{ alignItems: "center", gap: smaller ? 1 : 2 }}
    >
      <LegendIcon symbol={symbol} size={smaller ? 8 : 12} fill={color} />
      {dimension ? (
        <OpenMetadataPanelWrapper component={dimension}>
          {labelNode}
        </OpenMetadataPanelWrapper>
      ) : (
        labelNode
      )}
    </Flex>
  );
};
