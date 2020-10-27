import { ReactNode, useMemo } from "react";
import { Column, Row } from "react-table";
import { TableColumn, TableFields } from "../../configurator";
import { Observation, ObservationValue } from "../../domain/data";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";

export interface TableChartState {
  chartType: "table";
  bounds: Bounds;
  data: Observation[];
  // tableColumns: Column<Observation | ((r: Row<Observation>) => ObservationValue)>[];
  tableColumns: Column<$FixMe>[];
  columnStyles: Record<string, Omit<TableColumn, "isGroup" | "isHidden">[]>;
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
  const columnWithLabels = useMemo(
    () =>
      fields.columns.map((col) => ({
        label:
          [...dimensions, ...measures].find((d) => d.iri === col.componentIri)
            ?.label || col.componentIri,
        ...col,
      })),
    [dimensions, fields.columns, measures]
  );
  const memoizedData = useMemo(() => data, [data]);

  console.log({ columnWithLabels });

  const memoizedTableColumns = useMemo(
    () =>
      columnWithLabels.map((c) => ({
        Header: c.label,
        // We need a function here to avoid URI's "." to be parsed as JS property accessor.
        accessor: (r: Row<Observation>): ObservationValue =>
          r[`${c.componentIri}`],
      })),

    [columnWithLabels]
  );

  // ColumnStyles
  const columnStyles = columnWithLabels.reduce(
    (obj, col) => ({
      ...obj,
      [col.label]: col,
    }),
    {}
  );

  console.log(columnStyles);
  return {
    chartType: "table",
    bounds,
    data: memoizedData,
    tableColumns: memoizedTableColumns,
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
      {/* <InteractionProvider> */}
      <TableChartProvider
        data={data}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
      >
        {children}
      </TableChartProvider>
      {/* </InteractionProvider> */}
    </Observer>
  );
};
