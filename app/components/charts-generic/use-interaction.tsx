import React, {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer
} from "react";
import { Observation } from "../../domain";

export interface AnnotationState {
  visible: boolean;
  mouse?: { x: number; y: number } | undefined;
  d: Observation | undefined;
}

interface InteractionState {
  annotation: AnnotationState;
}

type InteractionStateAction =
  | {
      type: "ANNOTATION_UPDATE";
      value: Pick<InteractionState, "annotation">;
    }
  | {
      type: "ANNOTATION_HIDE";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  annotation: {
    visible: false,
    mouse: undefined,
    d: undefined
  }
};

// Reducer
const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "ANNOTATION_UPDATE":
      return {
        ...state,
        annotation: {
          visible: action.value.annotation.visible,
          mouse: action.value.annotation.mouse
            ? {
                x: action.value.annotation.mouse.x,
                y: action.value.annotation.mouse.y
              }
            : undefined,
          d: action.value.annotation.d
        }
      };
    case "ANNOTATION_HIDE":
      return {
        ...state,
        annotation: {
          ...state.annotation,
          visible: false,
          mouse: undefined
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
