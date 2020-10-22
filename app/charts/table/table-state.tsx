import { ReactNode } from "react";
import { BarFields } from "../../configurator";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { Bounds, Observer, useWidth } from "../shared/use-width";

export interface TableState {
  chartType: "table";
  bounds: Bounds;
}

const useTableState = ({
  data,
  fields,
}: Pick<ChartProps, "data"> & {
  fields: BarFields;
}): TableState => {
  const width = useWidth();
  const margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const chartWidth = width - margins.left - margins.right;
  const chartHeight = 600;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  return {
    chartType: "table",
    bounds,
  };
};

const TableChartProvider = ({
  data,
  fields,

  children,
}: Pick<ChartProps, "data"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useTableState({
    data,
    fields,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const TableChart = ({
  data,
  fields,
  children,
}: Pick<ChartProps, "data"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      {/* <InteractionProvider> */}
      <TableChartProvider data={data} fields={fields}>
        {children}
      </TableChartProvider>
      {/* </InteractionProvider> */}
    </Observer>
  );
};
