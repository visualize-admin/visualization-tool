import { ascending, extent, max, min } from "d3-array";
import {
  ScaleDiverging,
  ScaleLinear,
  ScaleOrdinal,
  ScaleSequential,
  scaleDiverging,
  scaleLinear,
  scaleOrdinal,
} from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";
import { useMemo } from "react";
import { Cell, Column, Row } from "react-table";

import {
  getLabelWithUnit,
  getSlugifiedIri,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { useSize } from "@/charts/shared/use-size";
import { BAR_CELL_PADDING, TABLE_HEIGHT } from "@/charts/table/constants";
import { getTableUIElementsOffset } from "@/charts/table/table";
import {
  TableStateVariables,
  useTableStateData,
  useTableStateVariables,
} from "@/charts/table/table-state-props";
import {
  ColumnStyleCategory,
  ColumnStyleHeatmap,
  ComponentType,
  TableConfig,
} from "@/configurator";
import {
  mkNumber,
  useOrderedTableColumns,
} from "@/configurator/components/ui-helpers";
import { Component, Observation } from "@/domain/data";
import { useDimensionFormatters, useFormatNumber } from "@/formatters";
import { getColorInterpolator } from "@/palettes";
import { getTextWidth } from "@/utils/get-text-width";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type MKColumnMeta<T> = {
  dim: Component;
  iri: string;
  slugifiedIri: string;
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

export type TableChartState = CommonChartState & {
  chartType: "table";
  rowHeight: number;
  showSearch: boolean;
  tableColumns: Column<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  groupingIris: string[];
  hiddenIris: string[];
  sortingIris: { id: string; desc: boolean }[];
};

const useTableState = (
  chartProps: ChartProps<TableConfig>,
  variables: TableStateVariables,
  data: ChartStateData
): TableChartState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const { chartData, allData } = data;
  const { fields, settings, sorting } = chartConfig;
  const formatNumber = useFormatNumber();

  const hasBar = Object.values(fields).some(
    (fValue) => fValue.columnStyle.type === "bar"
  );
  const rowHeight = hasBar ? 56 : 40;

  // Dimensions
  const { width } = useSize();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const chartWidth = width - margins.left - margins.right; // We probably don't need this
  const chartHeight = Math.min(
    TABLE_HEIGHT,
    // + 1 for the header row
    (chartData.length + 1) * rowHeight
  );

  const height =
    chartHeight +
    margins.top +
    margins.bottom +
    getTableUIElementsOffset({ showSearch: settings.showSearch, width });
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

  const types = [...dimensions, ...measures].reduce(
    (obj, c) => ({ ...obj, [getSlugifiedIri(c.iri)]: c.__typename }),
    {} as { [x: string]: ComponentType }
  );
  // Data used by react-table
  const memoizedData = useMemo(
    function replaceKeys() {
      // Only read keys once
      const keys = Object.keys(chartData[0] ?? []);
      const lkey = keys.length;
      const slugifiedKeys = keys.map(getSlugifiedIri);

      return chartData.map((d, index) => {
        const o = { id: index } as $IntentionalAny;
        // This is run often, so let's optimize it
        for (let i = 0; i < lkey; i++) {
          const ski = slugifiedKeys[i];
          const ki = keys[i];
          const v = d[ki];
          o[ski] =
            types[ski] !== "NumericalMeasure"
              ? v
              : v !== null && v !== undefined
                ? +v!
                : null;
        }
        return o;
      });
    },
    [chartData, types]
  );

  // Columns used by react-table
  const tableColumns = useMemo(() => {
    const allComponents = [...dimensions, ...measures];

    return orderedTableColumns.map((c) => {
      const headerComponent = allComponents.find(
        (d) => d.iri === c.componentIri
      );

      if (!headerComponent) {
        throw Error(`No dimension <${c.componentIri}> in cube!`);
      }

      const sorters = makeDimensionValueSorters(headerComponent, {
        sorting: { sortingType: "byTableSortingType", sortingOrder: "asc" },
      });

      const headerLabel = getLabelWithUnit(headerComponent);

      // The column width depends on the estimated width of the
      // longest value in the column, with a minimum of 150px.
      const columnItems = [...new Set(chartData.map((d) => d[c.componentIri]))];
      const columnItemSizes = [
        ...columnItems.map((item) => {
          const itemAsString =
            c.componentType === "NumericalMeasure"
              ? formatNumber(item as number)
              : item;

          return getTextWidth(`${itemAsString}`, { fontSize: 16 }) + 20;
        }),
      ];

      const width = Math.max(
        50,
        getTextWidth(headerLabel, { fontSize: 16 }) + 44,
        ...columnItemSizes
      );

      return {
        Header: headerLabel,
        // Slugify accessor to avoid IRI's "." to be parsed as JS object notation.
        accessor: getSlugifiedIri(c.componentIri),

        width,
        sortType: (
          rowA: Row<Observation>,
          rowB: Row<Observation>,
          colId: string
        ) => {
          for (const d of sorters) {
            const result = ascending(
              d(rowA.values[colId]),
              d(rowB.values[colId])
            );

            if (result) {
              return result;
            }
          }

          return 0;
        },
      };
    });
  }, [orderedTableColumns, chartData, dimensions, measures, formatNumber]);

  // Groupings used by react-table
  const groupingIris = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isGroup)
        .map((c) => getSlugifiedIri(c.componentIri)),
    [orderedTableColumns]
  );

  // Sorting used by react-table
  const sortingIris = useMemo(() => {
    return [
      // Prioritize the configured sorting
      ...sorting.map((s) => ({
        id: getSlugifiedIri(s.componentIri),
        desc: s.sortingOrder === "desc",
      })),
      // Add the remaining table columns to the sorting
      ...orderedTableColumns.flatMap((c) => {
        return sorting.some((s) => s.componentIri === c.componentIri)
          ? []
          : [
              {
                id: getSlugifiedIri(c.componentIri),
                desc: false,
              },
            ];
      }),
    ];
  }, [sorting, orderedTableColumns]);

  const formatters = useDimensionFormatters([...dimensions, ...measures]);

  const hiddenIris = useMemo(
    () =>
      orderedTableColumns
        .filter((c) => c.isHidden)
        .map((c) => getSlugifiedIri(c.componentIri)),
    [orderedTableColumns]
  );

  /**
   * TABLE FORMATTING
   * tableColumnsMeta contains styles for columns/cell components.
   * It is not used by react-table, only for custom styling.
   */
  const tableColumnsMeta = useMemo<TableChartState["tableColumnsMeta"]>(() => {
    const allColumnsByIri = Object.fromEntries(
      [...dimensions, ...measures].map((x) => [x.iri, x])
    );
    return mapKeys(
      mapValues(fields, (columnMeta, iri) => {
        const slugifiedIri = getSlugifiedIri(iri);
        const columnStyle = columnMeta.columnStyle;
        const columnStyleType = columnStyle.type;
        const columnComponentType = columnMeta.componentType;
        const formatter = formatters[iri];
        const cellFormatter = (x: Cell<Observation>) => formatter(x.value);
        const common = {
          dim: allColumnsByIri[iri],
          iri,
          slugifiedIri,
          columnComponentType,
          description: allColumnsByIri[iri]?.description || undefined,
          formatter: cellFormatter,
          ...columnStyle,
        } as const;
        if (columnStyleType === "text") {
          return common as TextColumnMeta;
        } else if (columnStyleType === "category") {
          const { colorMapping } = columnStyle as ColumnStyleCategory;
          const dimension = allColumnsByIri[iri];

          // Color scale (always from colorMappings)
          const colorScale = scaleOrdinal<string>();

          // get label (translated) matched with color
          const labelsAndColor = Object.keys(colorMapping).map(
            (colorMappingIri) => {
              const dvLabel = (
                dimension.values.find((s) => {
                  return s.value === colorMappingIri;
                }) || { label: "unknown" }
              ).label;

              return {
                label: dvLabel,
                color: colorMapping![colorMappingIri] ?? schemeCategory10[0],
              };
            }
          );

          colorScale.domain(labelsAndColor.map((s) => s.label));
          colorScale.range(labelsAndColor.map((s) => s.color));

          return {
            ...common,
            colorScale,
          } as CategoryColumnMeta;
        } else if (columnStyleType === "heatmap") {
          const absMinValue =
            min(chartData, (d) =>
              d[iri] !== null ? Math.abs(d[iri] as number) : 0
            ) || 0;
          const absMaxValue =
            max(chartData, (d) =>
              d[iri] !== null ? Math.abs(d[iri] as number) : 1
            ) || 1;
          const maxAbsoluteValue = Math.max(absMinValue, absMaxValue);
          const colorScale = scaleDiverging(
            getColorInterpolator((columnStyle as ColumnStyleHeatmap).palette)
          ).domain([-maxAbsoluteValue, 0, maxAbsoluteValue] || [-1, 0, 1]);
          return {
            ...common,
            colorScale,
          } as HeatmapColumnMeta;
        } else if (columnStyleType === "bar") {
          // The column width depends on the estimated width of the
          // longest value in the column, with a minimum of 150px.
          const columnItems = [
            ...new Set(
              chartData.map((d) =>
                d !== null && d[iri] !== null ? mkNumber(d[iri]) : NaN
              )
            ),
          ];
          const columnItemSizes = columnItems.map((item) => {
            const itemAsString = formatter(item);
            return getTextWidth(`${itemAsString}`, { fontSize: 16 }) + 80;
          });
          const width =
            Math.max(max(columnItemSizes, (d) => d) || 150, 150) -
            BAR_CELL_PADDING * 2;
          const domain = extent(columnItems, (d) => d) as [number, number];
          const widthScale = scaleLinear().domain(domain).range([0, width]);

          return { ...common, widthScale } as BarColumnMeta;
        } else {
          return null as never;
        }
      }),
      (v) => v.slugifiedIri
    );
  }, [chartData, dimensions, fields, formatters, measures]);

  return {
    chartType: "table",
    chartData: memoizedData,
    allData,
    bounds,
    rowHeight,
    showSearch: settings.showSearch,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    hiddenIris,
    sortingIris,
    ...variables,
  };
};

const TableChartProvider = (
  props: React.PropsWithChildren<ChartProps<TableConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useTableStateVariables(chartProps);
  const data = useTableStateData(chartProps);
  const state = useTableState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = (
  props: React.PropsWithChildren<ChartProps<TableConfig>>
) => {
  return <TableChartProvider {...props} />;
};
