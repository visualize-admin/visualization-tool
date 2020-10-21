import { createContext, useContext } from "react";
import { ChartFields } from "../../configurator";
import { Observation } from "../../domain/data";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { AreasState } from "./areas/areas-state";
import { GroupedBarsState } from "./bars/bars-grouped-state";
import { BarsState } from "./bars/bars-state";
import { GroupedColumnsState } from "./columns/columns-grouped-state";
import { StackedColumnsState } from "./columns/columns-stacked-state";
import { ColumnsState } from "./columns/columns-state";
import { LinesState } from "./lines/lines-state";
import { PieState } from "./pie/pie-state";
import { ScatterplotState } from "./scatterplot/scatterplot-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: ComponentFieldsFragment[];
  measures: ComponentFieldsFragment[];
}

export type ChartState =
  | BarsState
  | GroupedBarsState
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
