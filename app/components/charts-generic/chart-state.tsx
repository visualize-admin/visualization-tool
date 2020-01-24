import React, {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer
} from "react";
import { ChartObserver } from "./chart-observer";

// State & Actions
interface Bounds {
  width: number | undefined;
  height: number | undefined;
}
interface TooltipState {
  visible: boolean;
  x: number | undefined;
  y: number | undefined;
  content: string | undefined;
}
interface ChartState {
  bounds: Bounds;
  // margins:
  tooltip: TooltipState;
}

type ChartStateAction =
  | {
      type: "BOUNDS_UPDATE";
      value: Pick<ChartState, "bounds">;
    }
  | {
      type: "TOOLTIP_UPDATE";
      value: Pick<ChartState, "tooltip">;
    };

const CHART_INITIAL_STATE: ChartState = {
  bounds: { width: undefined, height: undefined },
  // margins: { top: 0, right: 0, bottom: 0, right: 0 },
  tooltip: {
    visible: false,
    x: undefined,
    y: undefined,
    content: undefined
  }
};

// Reducer
const chartStateReducer = (state: ChartState, action: ChartStateAction) => {
  switch (action.type) {
    case "BOUNDS_UPDATE":
      return {
        ...state,
        bounds: {
          width: action.value.bounds.width,
          height: action.value.bounds.height
        }
      };
    case "TOOLTIP_UPDATE":
      return {
        ...state,
        tooltip: {
          visible: action.value.tooltip.visible,
          x: action.value.tooltip.x,
          y: action.value.tooltip.y,
          content: action.value.tooltip.content
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
  return ctx;
};

// Component
export const Chart = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer<Reducer<ChartState, ChartStateAction>>(
    chartStateReducer,
    CHART_INITIAL_STATE
  );

  return (
    <ChartStateContext.Provider value={[state, dispatch]}>
      <ChartObserver>
        <ChartContainer>{children}</ChartContainer>
      </ChartObserver>
    </ChartStateContext.Provider>
  );
};

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  // @ts-ignore
  const [state, dispatch] = useChartState();
  const { width, height } = state.bounds;

  return <div style={{ position: "relative", width, height }}>{children}</div>;
};
