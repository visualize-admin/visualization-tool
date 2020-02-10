import { createContext, useContext } from "react";
import {
  ChartFields,
  DimensionWithMeta,
  MeasureWithMeta,
  Observation
} from "../../domain";
import { ColumnsState } from "./columns/columns-state";
import { LinesState } from "./lines/lines-state";
import { AreasState } from "./areas/areas-state";
import { ScatterplotState } from "./scatterplot/scatterplot-state";
import { PieState } from "./pie/pie-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

export type ChartState =
  | ColumnsState
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
