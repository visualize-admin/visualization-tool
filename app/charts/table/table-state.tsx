import { extent } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleSequential,
  scaleSequential,
} from "d3-scale";
import { ReactNode, useMemo } from "react";
import { Column, Row } from "react-table";
import { TableColumn, TableFields } from "../../configurator";
import { Observation, ObservationValue } from "../../domain/data";
import { getColorInterpolator, getPalette } from "../../domain/helpers";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";

interface TableColumnMetadata extends TableColumn {
  label: string;
  colorScale?:
    | ScaleOrdinal<string, string>
    | ScaleSequential<string>
    | undefined;
  widthScale?: ScaleLinear<number, number>;
}
export interface TableChartState {
  chartType: "table";
  bounds: Bounds;
  data: Observation[];
  // tableColumns: Column<Observation | ((r: Row<Observation>) => ObservationValue)>[];
  tableColumns: Column<$FixMe>[];
  // columnWithMetadata: TableColumnMetadata[];
  columnStyles: Record<string, TableColumnMetadata>;
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
  const chartHeight = 800;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  // Columns & data
  const columnWithMetadata = useMemo(
    () =>
      fields.columns.map((col) => {
        const widthScale =
          col.columnStyle === "bar"
            ? scaleLinear()
                .domain(
                  extent(data, (d) => +d[col.componentIri]) as [number, number]
                )
                .range([0, 100])
            : undefined;
        const colorScale =
          col.columnStyle === "heatmap"
            ? scaleSequential(getColorInterpolator(col.palette)).domain(
                (extent(data, (d) => +d[col.componentIri]) as [
                  number,
                  number
                ]) || [0, 1]
              )
            : col.columnStyle === "category"
            ? scaleOrdinal()
                .domain([...new Set(data, (d) => `${d[col.componentIri]}`)])
                .range(getPalette(col.palette))
            : undefined;
        return {
          label:
            [...dimensions, ...measures].find((d) => d.iri === col.componentIri)
              ?.label || col.componentIri,
          widthScale,
          colorScale,
          ...col,
        };
      }),
    [data, dimensions, fields.columns, measures]
  );
  const memoizedData = useMemo(() => data, [data]);

  console.log({ columnWithMetadata });

  const memoizedTableColumns = useMemo(
    () =>
      columnWithMetadata.map((c) => ({
        Header: c.label,
        // We need a function here to avoid URI's "." to be parsed as JS property accessor.
        accessor: (r: Row<Observation>): ObservationValue =>
          r[`${c.componentIri}`],
      })),

    [columnWithMetadata]
  );

  // ColumnStyles
  const columnStyles = columnWithMetadata.reduce(
    (obj, col) => ({
      ...obj,
      [col.label]: col,
    }),
    {}
  );

  return {
    chartType: "table",
    bounds,
    data: memoizedData,
    tableColumns: memoizedTableColumns,
    // columnWithMetadata,
    columnStyles,
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
