import { Reducer, useReducer, useEffect } from "react";

export type RDState<T> =
  | {
      state: "pending";
      data?: T;
    }
  | {
      state: "error";
      error: Error;
      data?: T;
    }
  | {
      state: "loaded";
      data: T;
    };

type RDAction<T> =
  | {
      type: "pending";
    }
  | {
      type: "loaded";
      data: T;
    }
  | {
      type: "error";
      error: Error;
    };

type RDReducer<T> = Reducer<RDState<T>, RDAction<T>>;

const remoteDataReducer = <T>(
  state: RDState<T>,
  action: RDAction<T>
): RDState<T> => {
  switch (action.type) {
    case "pending":
      return { state: "pending", data: state.data };
    case "loaded":
      return { state: "loaded", data: action.data };
    case "error":
      return { state: "error", error: action.error, data: state.data };
    default:
      throw Error("Wat");
  }
};

const initialState = { state: "pending" as const };

export const useRemoteData = <T>(runFetch: () => Promise<T>) => {
  const [remoteDataState, dispatch] = useReducer<RDReducer<T>>(
    remoteDataReducer,
    initialState
  );

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      if (!didCancel) {
        dispatch({ type: "pending" });
      }
      try {
        const data = (await runFetch()) as $Unexpressable;
        if (!didCancel) {
          dispatch({ type: "loaded", data });
        }
      } catch (error) {
        if (!didCancel) {
          console.error(error);
          dispatch({ type: "error", error });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [runFetch, dispatch]);

  return remoteDataState;
};
