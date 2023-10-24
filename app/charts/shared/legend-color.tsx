import { t } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import orderBy from "lodash/orderBy";
import { memo, useMemo } from "react";

import { ColorsChartState, useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { getLegendGroups } from "@/charts/shared/legend-color-helpers";
import Flex from "@/components/flex";
import { Checkbox, CheckboxProps } from "@/components/form";
import {
  ChartConfig,
  DataSource,
  GenericSegmentField,
  MapConfig,
  isSegmentInConfig,
  useReadOnlyConfiguratorState,
} from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDimensionValuesQuery,
} from "@/graphql/query-hooks";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useLocale } from "@/src";
import { useInteractiveFilters } from "@/stores/interactive-filters";
import { interlace } from "@/utils/interlace";
import { MaybeTooltip } from "@/utils/maybe-tooltip";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

export type LegendSymbol = "square" | "line" | "circle";

export type LegendItemUsage = "legend" | "tooltip" | "colorPicker";

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

const useItemStyles = makeStyles<Theme, ItemStyleProps>((theme) => ({
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
      width: ({ usage }) => (usage === "colorPicker" ? "0.75rem" : "0.5rem"),
      height: ({ symbol, usage }: ItemStyleProps) =>
        `calc(${["square", "circle"].includes(symbol) ? "0.5rem" : "2px"} * ${
          usage === "colorPicker" ? 1.5 : 1
        })`,
      marginTop: ({ symbol, usage }: ItemStyleProps) =>
        `calc(0.75rem - calc(${
          ["square", "circle"].includes(symbol) ? "0.5rem" : "2px"
        } * ${usage === "colorPicker" ? 1.5 : 1}) * 0.5)`,
      marginRight: "0.5rem",
      flexShrink: 0,
      backgroundColor: ({ color }: ItemStyleProps) => color,
      borderRadius: ({ symbol }: ItemStyleProps) =>
        symbol === "circle" ? "50%" : 0,
    },
  },

  legendCheckbox: {
    marginBottom: () => "0.25rem",
    marginRight: 0,
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
  const [{ data: cubeMetadata }] = useDimensionValuesQuery({
    variables: {
      dataCubeIri: dataset,
      dimensionIri: dimensionIri!,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !dimensionIri,
  });
  return useMemo(() => {
    return cubeMetadata?.dataCubeByIri?.dimensionByIri;
  }, [cubeMetadata?.dataCubeByIri?.dimensionByIri]);
};

const emptyObj = {};

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
    throw new Error(
      `Cannot call useLegendGroups from state ${configState.state}`
    );
  }

  const locale = useLocale();

  // FIXME: should color field also be included here?
  const segmentField = (
    isSegmentInConfig(chartConfig) ? chartConfig.fields.segment : null
  ) as GenericSegmentField | null | undefined;

  const segmentFilters = segmentField?.componentIri
    ? chartConfig.filters[segmentField.componentIri]
    : null;
  const segmentValues =
    segmentFilters?.type === "multi" ? segmentFilters.values : emptyObj;

  const { dataSet: dataset, dataSource } = configState;
  const segmentDimension = useDimension({
    dataset,
    dataSource,
    locale,
    dimensionIri: segmentField?.componentIri,
  });

  const [hierarchyResp] = useDimensionValuesQuery({
    variables: {
      dataCubeIri: dataset,
      dimensionIri: segmentDimension?.iri!,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !segmentDimension?.iri,
  });
  const hierarchy =
    hierarchyResp?.data?.dataCubeByIri?.dimensionByIri?.hierarchy;

  const groups = useMemo(() => {
    return getLegendGroups({
      title,
      values,
      hierarchy,
      sort: !!(segmentField && "sorting" in segmentField),
      labelIris: segmentValues,
    });
  }, [title, values, hierarchy, segmentField, segmentValues]);

  return groups;
};

type LegendColorProps = {
  chartConfig: ChartConfig;
  symbol: LegendSymbol;
  interactive?: boolean;
};

export const LegendColor = memo(function LegendColor(props: LegendColorProps) {
  const { chartConfig, symbol, interactive } = props;
  const { colors, getColorLabel } = useChartState() as ColorsChartState;
  const values = colors.domain();
  const groups = useLegendGroups({ chartConfig, values });

  return (
    <LegendColorContent
      groups={groups}
      getColor={(v) => colors(v)}
      getLabel={getColorLabel}
      symbol={symbol}
      interactive={interactive}
      numberOfOptions={values.length}
    />
  );
});

// TODO: add metadata to legend titles?
export const MapLegendColor = memo(function LegendColor({
  component,
  getColor,
  useAbbreviations,
  chartConfig,
}: {
  component: DimensionMetadataFragment;
  getColor: (d: Observation) => number[];
  useAbbreviations: boolean;
  chartConfig: MapConfig;
}) {
  const componentFilter = chartConfig.filters[component.iri];
  const sortedValues = useMemo(() => {
    const sorters = makeDimensionValueSorters(component, {
      sorting: {
        sortingType: "byAuto",
        sortingOrder: "asc",
      },
      dimensionFilter: componentFilter,
    });
    return orderBy(
      component.values,
      sorters.map((s) => (dv) => s(dv.label))
    ) as typeof component.values;
  }, [component, componentFilter]);
  const getLabel = useAbbreviations
    ? (d: string) => {
        const v = component.values.find((v) => v.value === d);
        return (v?.alternateName || v?.label) as string;
      }
    : (d: string) => {
        return component.values.find((v) => v.value === d)?.label as string;
      };
  const groups = useLegendGroups({
    chartConfig,
    title: component.label,
    values: sortedValues.map((d) => `${d.value}`),
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
      numberOfOptions={sortedValues.length}
    />
  );
});

type LegendColorContentProps = {
  groups: ReturnType<typeof useLegendGroups>;
  getColor: (d: string) => string;
  getLabel: (d: string) => string;
  symbol: LegendSymbol;
  interactive?: boolean;
  numberOfOptions: number;
};

const LegendColorContent = (props: LegendColorContentProps) => {
  const { groups, getColor, getLabel, symbol, interactive, numberOfOptions } =
    props;
  const classes = useStyles();
  const categories = useInteractiveFilters((d) => d.categories);
  const addCategory = useInteractiveFilters((d) => d.addCategory);
  const removeCategory = useInteractiveFilters((d) => d.removeCategory);

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
                      item={label}
                      color={getColor(d)}
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
    symbol,
    interactive,
    onToggle,
    checked,
    disabled,
    usage = "legend",
  } = props;
  const classes = useItemStyles({ symbol, color, usage });

  return interactive && onToggle ? (
    <MaybeTooltip
      text={
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
          label={item}
          name={item}
          value={item}
          checked={checked !== undefined ? checked : true}
          onChange={onToggle}
          key={item}
          color={color}
          className={classes.legendCheckbox}
        />
      </div>
    </MaybeTooltip>
  ) : (
    <Flex data-testid="legendItem" className={classes.legendItem}>
      {item}
    </Flex>
  );
};
