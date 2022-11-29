import qs from "qs";
import create, { StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

import { isRunningInBrowser } from "@/utils/is-running-in-browser";

type FlagStore<T extends object> = {
  flags: T;
  setFlag: (flagId: keyof T, newState: unknown) => void;
};

const mergeFlag = <T extends object>(
  state: FlagStore<T>["flags"],
  flagId: keyof T,
  newState: unknown
) => ({
  ...state,
  [flagId]: newState,
});

type PersistFlags<T extends object> = (
  config: StateCreator<FlagStore<T>>,
  options: PersistOptions<FlagStore<T>>
) => StateCreator<FlagStore<T>>;

export const createFlagStore = <T extends object>(defaults: Partial<T>) => {
  const useStore = create<FlagStore<T>>(
    (persist as unknown as PersistFlags<T>)(
      (set) => ({
        flags: {} as T,
        setFlag: (flagId: keyof T, newState: unknown) => {
          set((state) => ({
            flags: mergeFlag(state.flags, flagId, newState),
          }));
        },
      }),
      {
        name: "visualize-flags",
        getStorage: () => localStorage,
      }
    )
  );

  const useFlag = (flagName: keyof T) => useStore((s) => s.flags[flagName]);

  const flag = (name: keyof T, value?: any) => {
    const prevState = useStore.getState();

    if (value === undefined) {
      return prevState.flags[name as keyof typeof prevState.flags];
    } else {
      const newFlags = mergeFlag(prevState.flags, name as keyof T, value);
      useStore.setState({
        ...prevState,
        flags: newFlags,
      });
    }
  };

  const setDefaults = (defaults: Partial<T>) => {
    for (let k of Object.keys(defaults)) {
      // @ts-ignore
      flag(k, flag(k) || defaults[k]);
    }
  };

  const FLAG_PREFIX = "flag__";

  const initFromSearchParams = (locationSearch: string) => {
    locationSearch = locationSearch.startsWith("?")
      ? locationSearch.substr(1)
      : locationSearch;
    const params = qs.parse(locationSearch);
    for (const [param, value] of Object.entries(params)) {
      if (param.startsWith(FLAG_PREFIX) && typeof value === "string") {
        try {
          const flagName = param.substr(FLAG_PREFIX.length) as keyof T;
          flag(flagName, JSON.parse(value));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const reset = () => {
    useStore.setState({
      flags: {} as T,
    });
    for (let k of Object.keys(defaults)) {
      flag(k as keyof T, defaults[k as keyof T]);
    }
    initFromSearchParams(window.location.search);
  };

  setDefaults(defaults);
  if (isRunningInBrowser()) {
    // @ts-ignore
    window.flag = flag;
    initFromSearchParams(window.location.search);
  }

  return { useStore, useFlag, flag, setDefaults, initFromSearchParams, reset };
};

const { useStore, useFlag, flag, reset } = createFlagStore({
  debug: false,
  metadata: false,
  timeslider: false,
});

export { useStore, useFlag, flag, reset };
