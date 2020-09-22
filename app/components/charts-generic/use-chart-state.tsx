import { createContext, useContext } from "react";
import { ChartFields, Observation } from "../../domain";
import { ColumnsState } from "./columns/columns-state";
import { LinesState } from "./lines/lines-state";
import { AreasState } from "./areas/areas-state";
import { ScatterplotState } from "./scatterplot/scatterplot-state";
import { PieState } from "./pie/pie-state";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { StackedColumnsState } from "./columns/columns-stacked-state";
import { GroupedColumnsState } from "./columns/columns-grouped-state";
import { BarsState } from "./bars/bars-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
}

export type ChartState =
  | BarsState
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState
  | LinesState
  | AreasState
  | ScatterplotState
  | PieState
  | undefined;

export const ChartContext = createContext<ChartState>(undefined);

export const useChartState = () => {
  const ctx = useContext(ChartContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartStateProvider /> to useChartState()"
    );
  }
  return ctx;
};
