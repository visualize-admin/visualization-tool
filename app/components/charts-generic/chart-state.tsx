import React, {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer
} from "react";
import { useBounds, Observer } from "./observer";
import {
  Observation,
  ChartFields,
  DimensionWithMeta,
  MeasureWithMeta
} from "../../domain";
import { Loading } from "../hint";

// State & Actions
export interface ChartProps {
  data: Observation[];
  fields: ChartFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

interface TooltipState {
  visible: boolean;
  x: number | undefined;
  y: number | undefined;
  placement: "left" | "right";
  content: ReactNode | string | undefined;
}
interface ChartState {
  tooltip: TooltipState;
}

type ChartStateAction =
  | {
      type: "TOOLTIP_UPDATE";
      value: Pick<ChartState, "tooltip">;
    }
  | {
      type: "TOOLTIP_HIDE";
    };

const CHART_INITIAL_STATE: ChartState = {
  tooltip: {
    visible: false,
    x: undefined,
    y: undefined,
    placement: "right",
    content: undefined
  }
};

// Reducer
const chartStateReducer = (state: ChartState, action: ChartStateAction) => {
  switch (action.type) {
    case "TOOLTIP_UPDATE":
      return {
        ...state,
        tooltip: {
          visible: action.value.tooltip.visible,
          x: action.value.tooltip.x,
          y: action.value.tooltip.y,
          placement: action.value.tooltip.placement,
          content: action.value.tooltip.content
        }
      };
    case "TOOLTIP_HIDE":
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          visible: false
        }
      };

    default:
      throw new Error();
  }
};

// Provider
const ChartStateContext = createContext<
  [ChartState, Dispatch<ChartStateAction>] | undefined
>(undefined);

export const useChartState = () => {
  const ctx = useContext(ChartStateContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <Chart /> to useChartState()"
    );
  }
  return ctx;
};

// Component
export const Chart = ({
  children,
  aspectRatio
}: {
  children: ReactNode;
  aspectRatio: number;
}) => {
  const [state, dispatch] = useReducer<Reducer<ChartState, ChartStateAction>>(
    chartStateReducer,
    CHART_INITIAL_STATE
  );

  return (
    <Observer aspectRatio={aspectRatio}>
      <ChartStateContext.Provider value={[state, dispatch]}>
        {children}
      </ChartStateContext.Provider>
    </Observer>
  );
};

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  const bounds = useBounds();
  const { width, height } = bounds;

  return <div style={{ position: "relative", width, height }}>{children} </div>;
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const bounds = useBounds();
  const { width, height } = bounds;
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {children}
    </svg>
  );
};
