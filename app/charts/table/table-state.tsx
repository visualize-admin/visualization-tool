import { extent, max, min } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  scaleOrdinal,
  ScaleSequential,
  scaleSequential,
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
  getPalette,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { getSlugifiedIri, ROW_HEIGHT, TABLE_HEIGHT } from "./constants";

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
// | (ColumnStyleHeatmap & { colorScale?: ScaleSequential<string> })
// | ColumnStyleText
// | (ColumnStyleCategory & { colorScale: ScaleOrdinal<string, string> })
// | (ColumnStyleBar & { widthScale?: ScaleLinear<number, number> });

export interface TableChartState {
  chartType: "table";
  bounds: Bounds;
  showSearch: boolean;
  data: Observation[];
  tableColumns: Column<Observation>[];
  tableColumnsMeta: Record<string, ColumnMeta>;
  groupingIris: string[];
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
  const { fields, settings, sorting } = chartConfig;

  // Dimensions
  const width = useWidth();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const chartWidth = width - margins.left - margins.right; // We probably don't need this
  const chartHeight = Math.min(TABLE_HEIGHT, data.length * ROW_HEIGHT);
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  const orderedTableColumns = getOrderedTableColumns(fields);

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
        return {
          Header:
            [...dimensions, ...measures].find(
              (dim) => dim.iri === c.componentIri
            )?.label || c.componentIri,
          // Slugify accessor to avoid IRI's "." to be parsed as JS object notation.
          accessor: getSlugifiedIri(c.componentIri),
        };
      }),

    [dimensions, orderedTableColumns, measures]
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

  // Sorting used by react-table
  const sortingIris = useMemo(
    () =>
      sorting.map((s) => ({
        id: getSlugifiedIri(s.componentIri),
        desc: s.sortingOrder === "desc",
      })),
    [sorting]
  );

  // Columns with style
  // This is not use by react table to manage state, only for styling.
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
          const colorScale = scaleOrdinal()
            .domain([...new Set(data.map((d) => `${d[iri]}`))])
            .range(getPalette((columnStyle as ColumnStyleCategory).palette));
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
          const colorScale = scaleSequential(
            getColorInterpolator((columnStyle as ColumnStyleHeatmap).palette)
          ).domain(
            ([max(data, (d) => +d[iri]), min(data, (d) => +d[iri])] as [
              number,
              number
            ]) || [1, 0]
          );
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
          const widthScale = scaleLinear()
            .domain(extent(data, (d) => +d[iri]) as [number, number])
            .range([0, 100]);
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
    [data, fields]
  );
  return {
    chartType: "table",
    bounds,
    showSearch: settings.showSearch,
    data: memoizedData,
    tableColumns,
    tableColumnsMeta,
    groupingIris,
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
