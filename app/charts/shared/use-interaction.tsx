import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react";

import { Observation } from "@/domain/data";

type InteractionElement = {
  visible: boolean;
  mouse?: { x: number; y: number } | undefined;
  d: Observation | undefined;
};

type InteractionState = {
  interaction: InteractionElement;
};

type InteractionStateAction =
  | {
      type: "INTERACTION_UPDATE";
      value: InteractionState;
    }
  | {
      type: "INTERACTION_HIDE";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  interaction: {
    visible: false,
    mouse: undefined,
    d: undefined,
  },
};

const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "INTERACTION_UPDATE":
      const { visible, mouse, d } = action.value.interaction;

      return {
        ...state,
        interaction: { visible, mouse, d },
      };
    case "INTERACTION_HIDE":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visible: false,
          mouse: undefined,
        },
      };
    default:
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
  }
};

const InteractionStateContext = createContext<
  [InteractionState, Dispatch<InteractionStateAction>] | undefined
>(undefined);

export const useInteraction = () => {
  const ctx = useContext(InteractionStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <InteractionProvider /> to useInteraction()"
    );
  }

  return ctx;
};

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
