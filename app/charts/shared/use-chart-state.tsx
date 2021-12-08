import { createContext, useContext } from "react";
import { ChartFields, InteractiveFiltersConfig } from "../../configurator";
import { Observation } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";
import { AreasState } from "../area/areas-state";
import { GroupedBarsState } from "../bar/bars-grouped-state";
import { BarsState } from "../bar/bars-state";
import { GroupedColumnsState } from "../column/columns-grouped-state";
import { StackedColumnsState } from "../column/columns-stacked-state";
import { ColumnsState } from "../column/columns-state";
import { LinesState } from "../line/lines-state";
import { MapState } from "../map/map-state";
import { PieState } from "../pie/pie-state";
import { ScatterplotState } from "../scatterplot/scatterplot-state";
import { TableChartState } from "../table/table-state";

export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  interactiveFiltersConfig: InteractiveFiltersConfig;
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
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
  | TableChartState
  | MapState
  | undefined;

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
