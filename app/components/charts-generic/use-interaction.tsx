import React, {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer
} from "react";
import { RulerProps } from "./annotations/ruler";

interface TooltipState {
  visible: boolean;
  x: number | undefined;
  y: number | undefined;
  placement: "left" | "right";
  content: ReactNode | string | undefined;
}
interface RulerState {
  visible: boolean;
  x: number | undefined;
  placement: "left" | "right";
  points: RulerProps[] | undefined;
}
interface InteractionState {
  tooltip: TooltipState;
  ruler: RulerState;
}

type InteractionStateAction =
  | {
      type: "TOOLTIP_UPDATE";
      value: Pick<InteractionState, "tooltip">;
    }
  | {
      type: "TOOLTIP_HIDE";
    }
  | {
      type: "RULER_UPDATE";
      value: Pick<InteractionState, "ruler">;
    }
  | {
      type: "RULER_HIDE";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  tooltip: {
    visible: false,
    x: undefined,
    y: undefined,
    placement: "right",
    content: undefined
  },
  ruler: {
    visible: false,
    x: undefined,
    placement: "right",
    points: undefined
  }
};

// Reducer
const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
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
    case "RULER_UPDATE":
      return {
        ...state,
        ruler: {
          visible: action.value.ruler.visible,
          x: action.value.ruler.x,
          placement: action.value.ruler.placement,
          points: action.value.ruler.points
        }
      };
    case "RULER_HIDE":
      return {
        ...state,
        ruler: {
          ...state.ruler,
          visible: false
        }
      };

    default:
      throw new Error();
  }
};

// Provider
const InteractionStateContext = createContext<
  [InteractionState, Dispatch<InteractionStateAction>] | undefined
>(undefined);

export const useInteraction = () => {
  const ctx = useContext(InteractionStateContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <Chart /> to useChartState()"
    );
  }
  return ctx;
};

// Component
export const InteractionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer<
    Reducer<InteractionState, InteractionStateAction>
  >(InteractionStateReducer, INTERACTION_INITIAL_STATE);

  return (
    <InteractionStateContext.Provider value={[state, dispatch]}>
      {children}
    </InteractionStateContext.Provider>
  );
};
