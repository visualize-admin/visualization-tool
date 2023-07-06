import { createContext, useContext } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { MapState } from "@/charts/map/map-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { TableChartState } from "@/charts/table/table-state";
import { Has } from "@/domain/types";

export type ChartState =
  | AreasState
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState
  | LinesState
  | MapState
  | PieState
  | ScatterplotState
  | TableChartState
  | undefined;

export type ColorsChartState = Has<ChartState, "colors">;
export const ChartContext = createContext<ChartState>(undefined);

export const useChartState = () => {
  const ctx = useContext(ChartContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartContext.Provider /> to useChartState()"
    );
  }
  return ctx;
};
