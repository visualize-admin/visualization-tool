import { extent, max, min } from "d3-array";
import {
  scaleDiverging,
  ScaleLinear,
  scaleLinear,
  scaleOrdinal,
  ScaleSequential,
} from "d3-scale";
import { ReactNode, useMemo } from "react";
import { Column } from "react-table";
import {
  ColumnStyleCategory,
  ColumnStyleHeatmap,
  ComponentType,
  TableConfig,
} from "../../configurator";
import {
  getColorInterpolator,
  getOrderedTableColumns,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { DimensionFieldsWithValuesFragment } from "../../graphql/query-hooks";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { useTheme } from "../../themes";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import {
  BAR_CELL_PADDING,
  SORTING_ARROW_WIDTH,
  TABLE_HEIGHT,
} from "./constants";
import { getSlugifiedIri } from "./table-helpers";

export interface ColumnMeta {
  iri: string;
  slugifiedIri: string;
  columnComponentType: ComponentType;
  colorScale?: ScaleSequential<string>;
  widthScale?: ScaleLinear<number, number>;
  type: string;
  textStyle: string;
  textColor: string;
  columnColor: string;
  barColorPositive: string;
  barColorNegative: string;
  barColorBackground: string;
  barShowBackground: boolean;
}

export interface TableChartState {
  chartType: "table";
  bounds: Bounds;
  rowHeight: number;
  showSearch: boolean;
  data: Observation[];
  tableColumns: Column<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  groupingIris: string[];
  hiddenIris: string[];
  sortingIris: { id: string; desc: boolean }[];
}

const useTableState = ({
  data,
  dimensions,
  measures,
  chartConfig,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  chartConfig: TableConfig;
}): TableChartState => {
  const theme = useTheme();
  const { fields, settings, sorting } = chartConfig;
  const formatNumber = useFormatNumber();

  const hasBar = Object.values(fields).some(
    (fValue) => fValue.columnStyle.type === "bar"
  );
  const rowHeight = hasBar ? 56 : 40;

  // Dimensions
  const width = useWidth();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const chartWidth = width - margins.left - margins.right; // We probably don't need this
  const chartHeight = Math.min(TABLE_HEIGHT, data.length * rowHeight);
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  const orderedTableColumns = getOrderedTableColumns(fields);

  /**
   * REACT-TABLE CONFIGURATION
   * React-table is a headless hook, the following code
   * is used to manage its internal state from the editor.
   */

  // Data used by react-table
  const memoizedData = useMemo(
    () =>
      data.map((d, i) =>
        Object.keys(d).reduce(
          (obj, k) => ({ ...obj, [getSlugifiedIri(k)]: d[k] }),
          { id: i }
        )
      ),
    [data]
  );

  // Columns used by react-table
  const tableColumns = useMemo(
    () =>
      orderedTableColumns.map((c) => {
        const headerLabel =
          [...dimensions, ...measures].find((dim) => dim.iri === c.componentIri)
            ?.label || c.componentIri;
        const headerLabelSize =
          estimateTextWidth(headerLabel, 16) + SORTING_ARROW_WIDTH;
        // The column width depends on the estimated width of the
        // longest value in the column, with a minimum of 150px.
        const columnItems = [...new Set(data.map((d) => d[c.componentIri]))];
        const columnItemSizes = [
          ...columnItems.map((item) => {
            const itemAsString =
              c.componentType === "Measure"
                ? formatNumber(item as number)
                : item;
            return estimateTextWidth(`${itemAsString}`, 16) + 20;
          }),
          // headerLabelSize,
        ];
        const width = Math.max(max(columnItemSizes, (d) => d) || 150, 150);

        return {
          Header: headerLabel,
          // Slugify accessor to avoid IRI's "." to be parsed as JS object notation.
          accessor: getSlugifiedIri(c.componentIri),

          width,
          // If sort type is not "basic", react-table default to "alphanumeric"
          // which doesn't sort negative values properly.
          sortType: "basic",
        };
      }),

    [orderedTableColumns, data, dimensions, measures, formatNumber]
  );

  // Groupings used by react-table
  const groupingIris = useMemo(
    () =>
      Object.keys(fields).reduce((iris, colIndex) => {
        if (fields[colIndex].isGroup) {
          const iri = getSlugifiedIri(fields[colIndex].componentIri);
          return [...iris, iri];
        } else {
          return iris;
        }
      }, [] as string[]),
    [fields]
  );
  console.log({ groupingIris });
  // Sorting used by react-table
  const sortingIris = useMemo(
    () =>
      sorting.map((s) => ({
        id: getSlugifiedIri(s.componentIri),
        desc: s.sortingOrder === "desc",
      })),
    [sorting]
  );

  const hiddenIris = useMemo(
    () =>
      Object.keys(fields).reduce((iris, colIndex) => {
        if (fields[colIndex].isHidden) {
          const iri = getSlugifiedIri(fields[colIndex].componentIri);
          return [...iris, iri];
        } else {
          return iris;
        }
      }, [] as string[]),
    [fields]
  );

  /**
   * TABLE FORMATTING
   * tableColumnsMeta contains styles for columns/cell components.
   * It is not used by react-table, only for custom styling.
   */
  const tableColumnsMeta = useMemo(
    () =>
      Object.keys(fields).reduce((acc, iri, i) => {
        const columnMeta = fields[iri];
        const slugifiedIri = getSlugifiedIri(iri);
        const columnStyle = columnMeta.columnStyle;
        const columnStyleType = columnStyle.type;
        const columnComponentType = columnMeta.componentType;

        if (columnStyleType === "text") {
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "category") {
          const { colorMapping } = columnStyle as ColumnStyleCategory;
          const dimensionValues = dimensions.find(
            (d) => d.iri === iri
          ) as DimensionFieldsWithValuesFragment;

          // Color scale (always from colorMappings)
          const colorScale = scaleOrdinal();

          // get label (translated) matched with color
          const labelsAndColor = Object.keys(colorMapping).map(
            (colorMappingIri) => {
              const dvLabel = (
                dimensionValues.values.find((s) => {
                  return s.value === colorMappingIri;
                }) || { label: "unknown" }
              ).label;

              return {
                label: dvLabel,
                color: colorMapping![colorMappingIri] || theme.colors.primary,
              };
            }
          );

          colorScale.domain(labelsAndColor.map((s) => s.label));
          colorScale.range(labelsAndColor.map((s) => s.color));

          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              colorScale,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "heatmap") {
          const absMinValue = min(data, (d) => Math.abs(+d[iri])) || 0;
          const absMaxValue = max(data, (d) => Math.abs(+d[iri])) || 1;
          const maxAbsoluteValue = Math.max(absMinValue, absMaxValue);
          const colorScale = scaleDiverging(
            getColorInterpolator((columnStyle as ColumnStyleHeatmap).palette)
          ).domain([-maxAbsoluteValue, 0, maxAbsoluteValue] || [-1, 0, 1]);
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              colorScale,
              ...columnStyle,
            },
          };
        } else if (columnStyleType === "bar") {
          // The column width depends on the estimated width of the
          // longest value in the column, with a minimum of 150px.
          const columnItems = [...new Set(data.map((d) => d[iri]))];
          const columnItemSizes = columnItems.map((item) => {
            const itemAsString =
              columnComponentType === "Measure"
                ? formatNumber(item as number)
                : item;
            return estimateTextWidth(`${itemAsString}`, 16) + 80;
          });
          const width =
            Math.max(max(columnItemSizes, (d) => d) || 150, 150) -
            BAR_CELL_PADDING * 2;
          // const hasNegativeValue =
          //   (min(data, (d) => Math.abs(+d[iri])) || 0) < 0;

          const widthScale = scaleLinear()
            .domain(extent(data, (d) => +d[iri]) as [number, number])
            .range([0, width]);
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              widthScale,
              ...columnStyle,
            },
          };
        } else {
          return {
            ...acc,
            [slugifiedIri]: {
              slugifiedIri,
              columnComponentType,
              ...columnStyle,
            },
          };
        }
      }, {}),
    [data, dimensions, fields, formatNumber]
  );

  return {
    chartType: "table",
    bounds,
    rowHeight,
    showSearch: settings.showSearch,
    data: memoizedData,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
    hiddenIris,
    sortingIris,
  };
};

//  ------------------------------------------------------------------------------------ //
//  ------------------------------------------------------------------------------------ //

const TableChartProvider = ({
  data,
  dimensions,
  measures,
  children,
  chartConfig,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  chartConfig: TableConfig;
}) => {
  const state = useTableState({
    data,
    dimensions,
    measures,
    chartConfig,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = ({
  data,
  dimensions,
  measures,
  chartConfig,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  chartConfig: TableConfig;
}) => {
  return (
    <Observer>
      <TableChartProvider
        data={data}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
      >
        {children}
      </TableChartProvider>
    </Observer>
  );
};
