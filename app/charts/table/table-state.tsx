import { t } from "@lingui/macro";
import { extent } from "d3-array";
import {
  ScaleDiverging,
  scaleDiverging,
  ScaleLinear,
  ScaleOrdinal,
  ScaleSequential,
  scaleTime,
  ScaleTime,
} from "d3-scale";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";
import { PropsWithChildren, useMemo } from "react";
import { Cell, Column } from "react-table";

import {
  getLabelWithUnit,
  getSlugifiedId,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { useSize } from "@/charts/shared/use-size";
import {
  abbreviateObservations,
  useAbbreviatedComponents,
  usesAbbreviations,
} from "@/charts/table/abbreviate-observations";
import {
  makeCategoryColorScale,
  makeColumnSortType,
} from "@/charts/table/column-helpers";
import { useColumnStats } from "@/charts/table/column-stats";
import { LIMITED_COLUMN_WIDTH, TABLE_HEIGHT } from "@/charts/table/constants";
import { getNaturalColumnWidth } from "@/charts/table/natural-column-width";
import {
  TableStateVariables,
  useTableStateData,
  useTableStateVariables,
} from "@/charts/table/table-state-props";
import { columnCanBeWidthLimited } from "@/charts/table/width-limit";
import {
  ColumnStyleCategory,
  ColumnStyleHeatmap,
  ComponentType,
  TableConfig,
  TableLinks,
} from "@/configurator";
import { useOrderedTableColumns } from "@/configurator/components/ui-helpers";
import {
  Component,
  Observation,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { useDimensionFormatters, useFormatNumber } from "@/formatters";
import { useLocale } from "@/locales/use-locale";
import { getColorInterpolator } from "@/palettes";

import { ChartProps } from "../shared/chart-props";

type MKColumnMeta<T> = {
  dim: Component;
  id: string;
  slugifiedId: string;
  description?: string;
  columnComponentType: ComponentType;
  formatter: (cell: Cell<Observation, any>) => string;
  textStyle?: string;
  textColor?: string;
  columnColor?: string;
  barShowBackground?: boolean;
  barColorBackground?: string;
  barColorNegative?: string;
  barColorPositive?: string;
} & T;

type BarColumnMeta = MKColumnMeta<{
  type: "bar";
  widthScale: ScaleLinear<number, number>;
}>;

type HeatmapColumnMeta = MKColumnMeta<{
  type: "heatmap";
  colorScale:
    | ScaleSequential<string>
    | ScaleDiverging<string>
    | ScaleOrdinal<string, string, never>;
}>;

type CategoryColumnMeta = MKColumnMeta<{
  type: "category";
  colorScale: ScaleOrdinal<string, string, never>;
}>;

type TextColumnMeta = MKColumnMeta<{
  type: "text";
}>;

export type ColumnMeta =
  | BarColumnMeta
  | HeatmapColumnMeta
  | CategoryColumnMeta
  | TextColumnMeta
  | MKColumnMeta<{ type: "other" }>;

type TableInteractiveTimeRangeState = {
  xDimension?: TemporalDimension | TemporalEntityDimension;
  getX: (d: Observation) => Date;
  xScaleTimeRange: ScaleTime<number, number>;
};

export type TableChartState = CommonChartState &
  TableInteractiveTimeRangeState & {
    chartType: "table";
    /** The chart title, or a generic name when the chart has none. */
    tableLabel: string;
    rowHeight: number;
    showSearch: boolean;
    expandFirstGroup: boolean;
    tableColumns: Column<Observation>[];
    tableColumnsMeta: Record<string, ColumnMeta>;
    groupingIds: string[];
    hiddenIds: string[];
    sortingIds: { id: string; desc: boolean }[];
    shouldApplyWidthLimits: boolean;
    links: TableLinks;
  };

const useTableState = (
  chartProps: ChartProps<TableConfig>,
  variables: TableStateVariables,
  data: ChartStateData
): TableChartState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const { getX } = variables;
  const { allData, timeRangeData } = data;
  const { fields, settings, links, sorting } = chartConfig;
  const allComponents = useMemo(
    () => [...dimensions, ...measures],
    [dimensions, measures]
  );
  const abbreviatedComponents = useAbbreviatedComponents({
    fields,
    components: allComponents,
  });
  const chartData = useMemo(
    () =>
      abbreviateObservations({
        observations: data.chartData,
        components: abbreviatedComponents,
      }),
    [data.chartData, abbreviatedComponents]
  );
  const formatNumber = useFormatNumber();
  const locale = useLocale();

  const hasBar = Object.values(fields).some(
    (fValue) => fValue.columnStyle.type === "bar"
  );
  const rowHeight = hasBar ? 56 : 40;

  const { width } = useSize();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const chartWidth = width - margins.left - margins.right;
  // The table sizes itself to its rows, see `Table`.
  const chartHeight = TABLE_HEIGHT;

  const height = chartHeight + margins.top + margins.bottom;
  const bounds = {
    width,
    height,
    aspectRatio: height / width,
    margins,
    chartWidth,
    chartHeight,
  };

  const orderedTableColumns = useOrderedTableColumns(fields);

  /**
   * REACT-TABLE CONFIGURATION
   * React-table is a headless hook, the following code
   * is used to manage its internal state from the editor.
   */

  const types = useMemo(() => {
    return Object.fromEntries(
      allComponents.map((c) => [getSlugifiedId(c.id), c.__typename])
    ) as Record<string, ComponentType>;
  }, [allComponents]);
  // Data used by react-table
  const memoizedData = useMemo(
    function replaceKeys() {
      // Only read keys once
      const keys = Object.keys(chartData[0] ?? []);
      const n = keys.length;
      const slugifiedKeys = keys.map(getSlugifiedId);

      return chartData.map((d, index) => {
        const o = { id: index } as $IntentionalAny;

        for (let i = 0; i < n; i++) {
          const slugifiedKey = slugifiedKeys[i];
          const key = keys[i];
          const value = d[key];
          o[slugifiedKey] =
            types[slugifiedKey] !== "NumericalMeasure"
              ? value
              : value !== null && value !== undefined
                ? +value
                : null;
        }

        return o;
      });
    },
    [chartData, types]
  );

  const naturalColumnWidths = useMemo(() => {
    return Object.fromEntries(
      allComponents.map((component) => [
        component.id,
        getNaturalColumnWidth({
          component,
          observations: chartData,
          formatNumber,
        }),
      ])
    );
  }, [allComponents, chartData, formatNumber]);

  const tableColumnsData = useMemo(() => {
    const columnData = orderedTableColumns.map((c) => {
      const headerComponent = allComponents.find((d) => d.id === c.componentId);

      if (!headerComponent) {
        throw Error(`No dimension <${c.componentId}> in cube!`);
      }

      const sortType = makeColumnSortType({
        component: headerComponent,
        useAbbreviations: usesAbbreviations({
          column: c,
          component: headerComponent,
        }),
      });

      return {
        c,
        headerComponent,
        headerLabel: getLabelWithUnit(headerComponent),
        sortType,
        naturalWidth: naturalColumnWidths[c.componentId],
        canBeWidthLimited: columnCanBeWidthLimited(
          fields[c.componentId].columnStyle.type
        ),
      };
    });

    const totalNaturalWidth = columnData.reduce(
      (sum, col) => sum + col.naturalWidth,
      0
    );

    const shouldApplyLimits =
      settings.limitColumnWidths && totalNaturalWidth > chartWidth;

    const columns = columnData.map(
      ({ c, headerLabel, sortType, naturalWidth, canBeWidthLimited }) => {
        const width =
          shouldApplyLimits && canBeWidthLimited
            ? Math.min(naturalWidth, LIMITED_COLUMN_WIDTH)
            : naturalWidth;

        return {
          Header: headerLabel,
          // Slugify accessor to avoid id's "." to be parsed as JS object notation.
          accessor: getSlugifiedId(c.componentId),
          width,
          sortType,
        };
      }
    );

    return { columns, shouldApplyLimits };
  }, [
    allComponents,
    orderedTableColumns,
    naturalColumnWidths,
    fields,
    chartWidth,
    settings.limitColumnWidths,
  ]);

  // Columns used by react-table
  const tableColumns = tableColumnsData.columns;
  const shouldApplyWidthLimits = tableColumnsData.shouldApplyLimits;

  // Groupings used by react-table
  const groupingIds = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isGroup)
        .map((c) => getSlugifiedId(c.componentId)),
    [orderedTableColumns]
  );

  // Sorting used by react-table
  const sortingIds = useMemo(() => {
    return [
      // Prioritize the configured sorting
      ...sorting.map((s) => ({
        id: getSlugifiedId(s.componentId),
        desc: s.sortingOrder === "desc",
      })),
      // Add the remaining table columns to the sorting
      ...orderedTableColumns.flatMap((c) => {
        return sorting.some((s) => s.componentId === c.componentId)
          ? []
          : [{ id: getSlugifiedId(c.componentId), desc: false }];
      }),
    ];
  }, [sorting, orderedTableColumns]);

  const formatters = useDimensionFormatters(allComponents);
  const { barWidthScales, heatmapMaxAbsoluteValues } = useColumnStats({
    fields,
    observations: chartData,
    formatters,
  });

  const hiddenIds = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isHidden)
        .map((c) => getSlugifiedId(c.componentId)),
    [orderedTableColumns]
  );

  /**
   * TABLE FORMATTING
   * tableColumnsMeta contains styles for columns/cell components.
   * It is not used by react-table, only for custom styling.
   */
  const tableColumnsMeta = useMemo<TableChartState["tableColumnsMeta"]>(() => {
    const allColumnsById = Object.fromEntries(
      allComponents.map((x) => [x.id, x])
    );
    const meta: Record<string, ColumnMeta> = mapKeys(
      mapValues(fields, (columnMeta, id) => {
        const slugifiedId = getSlugifiedId(id);
        const columnStyle = columnMeta.columnStyle;
        const columnStyleType = columnStyle.type;
        const columnComponentType = columnMeta.componentType;
        const formatter = formatters[id];
        const cellFormatter = (x: Cell<Observation>) => formatter(x.value);
        const common = {
          dim: allColumnsById[id],
          id,
          slugifiedId,
          columnComponentType,
          description: allColumnsById[id]?.description || undefined,
          formatter: cellFormatter,
          ...columnStyle,
        } as const;
        if (columnStyleType === "text") {
          return common as TextColumnMeta;
        } else if (columnStyleType === "category") {
          const { colorMapping } = columnStyle as ColumnStyleCategory;
          const colorScale = makeCategoryColorScale({
            dimension: allColumnsById[id],
            colorMapping,
            useAbbreviations: usesAbbreviations({
              column: columnMeta,
              component: allColumnsById[id],
            }),
          });

          return {
            ...common,
            colorScale,
          } as CategoryColumnMeta;
        } else if (columnStyleType === "heatmap") {
          const maxAbsoluteValue = heatmapMaxAbsoluteValues[id];
          const colorScale = scaleDiverging(
            getColorInterpolator((columnStyle as ColumnStyleHeatmap).paletteId)
          ).domain([-maxAbsoluteValue, 0, maxAbsoluteValue]);
          return {
            ...common,
            colorScale,
          } as HeatmapColumnMeta;
        } else if (columnStyleType === "bar") {
          const widthScale = barWidthScales[id];

          return { ...common, widthScale } as BarColumnMeta;
        } else {
          return null as never;
        }
      }),
      (v) => v.slugifiedId
    );

    return meta;
  }, [
    allComponents,
    fields,
    formatters,
    barWidthScales,
    heatmapMaxAbsoluteValues,
  ]);

  const xScaleTimeRange = useMemo(() => {
    const xScaleTimeRangeDomain = extent(timeRangeData, (d) => getX(d)) as [
      Date,
      Date,
    ];
    return scaleTime().domain(xScaleTimeRangeDomain);
  }, [getX, timeRangeData]);

  xScaleTimeRange.range([0, chartWidth]);

  return {
    chartType: "table",
    tableLabel:
      chartConfig.meta.title[locale] ||
      t({ id: "chart.table.label", message: "Table" }),
    chartData: memoizedData,
    allData,
    bounds,
    rowHeight,
    showSearch: settings.showSearch,
    expandFirstGroup: settings.expandFirstGroup,
    tableColumns,
    tableColumnsMeta,
    groupingIds,
    hiddenIds,
    sortingIds,
    shouldApplyWidthLimits,
    xScaleTimeRange,
    links,
    ...variables,
  };
};

const TableChartProvider = (
  props: PropsWithChildren<ChartProps<TableConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useTableStateVariables(chartProps);
  const data = useTableStateData(chartProps, variables);
  const state = useTableState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = (
  props: PropsWithChildren<ChartProps<TableConfig>>
) => {
  return <TableChartProvider {...props} />;
};
