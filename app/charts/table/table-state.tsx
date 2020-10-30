import { extent } from "d3-array";
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
  TableFields,
} from "../../configurator";
import {
  getColorInterpolator,
  getPalette,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { ROW_HEIGHT, TABLE_HEIGHT } from "./constants";

export interface ColumnMeta {
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
  data: Observation[];
  tableColumns: Column<Observation>[];
  tableColumnsMeta: ColumnMeta[];
  groupingHeaders: string[];
}

const useTableState = ({
  data,
  dimensions,
  measures,
  fields,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: TableFields;
}): TableChartState => {
  const width = useWidth();

  // Dimensions
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

  const memoizedData = useMemo(() => data, [data]);

  // Columns for the table instance
  const tableColumns = useMemo(
    () =>
      Object.keys(fields).map((colIndex) => {
        const iri = fields[colIndex].componentIri;

        return {
          Header:
            [...dimensions, ...measures].find((dim) => dim.iri === iri)
              ?.label || iri,
          // We need a function here to avoid URI's "." to be parsed as JS property accessor.
          accessor: (r: Observation) => r[iri],
        };
      }),

    [dimensions, fields, measures]
  );

  // Column styles
  const tableColumnsMeta = useMemo(
    () =>
      Object.keys(fields).map((colIndex) => {
        const iri = fields[colIndex].componentIri;
        const columnStyleType = fields[colIndex].columnStyle.type;

        if (columnStyleType === "text") {
          return fields[colIndex].columnStyle;
        } else if (columnStyleType === "category") {
          const colorScale = scaleOrdinal()
            .domain([...new Set(data.map((d) => `${d[iri]}`))])
            .range(
              getPalette(
                (fields[colIndex].columnStyle as ColumnStyleCategory).palette
              )
            );
          return {
            colorScale,
            ...fields[colIndex].columnStyle,
          };
        } else if (columnStyleType === "heatmap") {
          const colorScale = scaleSequential(
            getColorInterpolator(
              (fields[colIndex].columnStyle as ColumnStyleHeatmap).palette
            )
          ).domain(
            (extent(data, (d) => +d[iri]) as [number, number]) || [0, 1]
          );
          return {
            colorScale,
            ...fields[colIndex].columnStyle,
          };
        } else if (columnStyleType === "bar") {
          const widthScale = scaleLinear()
            .domain(extent(data, (d) => +d[iri]) as [number, number])
            .range([0, 100]);
          return {
            widthScale,
            ...fields[colIndex].columnStyle,
          };
        } else {
          return fields[colIndex].columnStyle;
        }
      }),

    [data, fields]
  ) as ColumnMeta[];

  // Groupings
  const groupingHeaders = useMemo(
    () =>
      Object.keys(fields).reduce((iris, colIndex) => {
        if (fields[colIndex].isGroup) {
          const iri = fields[colIndex].componentIri;
          const Header =
            [...dimensions, ...measures].find((dim) => dim.iri === iri)
              ?.label || iri;
          return [...iris, Header];
        } else {
          return iris;
        }
      }, [] as string[]),
    [dimensions, fields, measures]
  );

  return {
    chartType: "table",
    bounds,
    data: memoizedData,
    tableColumns,
    tableColumnsMeta,
    groupingHeaders,
  };
};

//  ------------------------------------------------------------------------------------ //
//  ------------------------------------------------------------------------------------ //

const TableChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: TableFields;
}) => {
  const state = useTableState({
    data,
    dimensions,
    measures,
    fields,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: TableFields;
}) => {
  return (
    <Observer>
      <TableChartProvider
        data={data}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
      >
        {children}
      </TableChartProvider>
    </Observer>
  );
};
