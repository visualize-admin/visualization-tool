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
  isLocked: boolean;
};

type InteractionState = {
  interaction: InteractionElement;
};

type InteractionStateAction =
  | {
      type: "INTERACTION_UPDATE";
      value: Pick<InteractionState, "interaction">;
    }
  | {
      type: "INTERACTION_HIDE";
    }
  | {
      type: "INTERACTION_LOCK";
    }
  | {
      type: "INTERACTION_UNLOCK";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  interaction: {
    visible: false,
    mouse: undefined,
    d: undefined,
    isLocked: false,
  },
};

const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "INTERACTION_LOCK":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isLocked: true,
        },
      };
    case "INTERACTION_UNLOCK":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isLocked: false,
        },
      };
    case "INTERACTION_UPDATE":
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visible: action.value.interaction.visible,
          mouse: action.value.interaction.mouse
            ? {
                x: action.value.interaction.mouse.x,
                y: action.value.interaction.mouse.y,
              }
            : undefined,
          d: action.value.interaction.d,
        },
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
      throw Error();
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
