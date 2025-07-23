import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react";

import { Observation } from "@/domain/data";

type BaseInteraction = {
  visible: boolean;
  observation: Observation | undefined;
};

type TooltipInteraction = BaseInteraction & {
  type: "tooltip";
  mouse?: {
    x: number;
    y: number;
  };
};

type AnnotationInteraction = BaseInteraction & {
  type: "annotation";
  focusingSegment?: boolean;
  segment?: string;
};

type InteractionState = TooltipInteraction | AnnotationInteraction;

type InteractionStateAction =
  | {
      type: "INTERACTION_UPDATE";
      value: InteractionState;
    }
  | {
      type: "INTERACTION_HIDE";
    };

const INTERACTION_INITIAL_STATE: InteractionState = {
  type: "tooltip",
  observation: undefined,
  visible: false,
  mouse: undefined,
};

const InteractionStateReducer = (
  state: InteractionState,
  action: InteractionStateAction
) => {
  switch (action.type) {
    case "INTERACTION_UPDATE":
      return action.value satisfies InteractionState;
    case "INTERACTION_HIDE":
      return {
        type: state.type,
        observation: undefined,
        visible: false,
        mouse: undefined,
      } satisfies InteractionState;
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
