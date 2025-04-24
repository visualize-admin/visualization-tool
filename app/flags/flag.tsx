import qs from "qs";

import { isRunningInBrowser } from "@/utils/is-running-in-browser";

import FlagStore from "./store";
import { FlagName, FLAGS, FlagValue } from "./types";

export const FLAG_PREFIX = "flag__";

const store = new FlagStore();

/**
 * Public API to use flags
 */
export const flag = function flag(...args: [FlagName] | [FlagName, FlagValue]) {
  if (args.length === 1) {
    return store.get(args[0]);
  } else {
    const [name, value] = args;
    store.set(name, value);

    return value;
  }
};

/** List all flag names from the store */
const listFlagNames = () => {
  return store.keys().sort();
};

/** List all flags from the store */
const listFlags = () => {
  return listFlagNames().map((name) => ({
    name,
    description: FLAGS.find((flag) => flag.name === name)?.description,
    value: store.get(name as FlagName),
  }));
};

/** Resets all the flags */
const resetFlags = () => {
  listFlagNames().forEach((name) => store.remove(name as FlagName));
};

/**
 * Enables several flags
 *
 * Supports passing either object flagName -> flagValue
 *
 * @param {Record<string, boolean>} flagsToEnable
 */
const enable = (flagsToEnable: FlagName[]) => {
  const flagNameToValue = Object.entries(flagsToEnable);

  if (!flagNameToValue) {
    return;
  }

  flagNameToValue.forEach(([flagName, flagValue]) => {
    flag(flagName as FlagName, flagValue);
  });
};

flag.store = store;
flag.listNames = listFlagNames;
flag.list = listFlags;
flag.reset = resetFlags;
flag.enable = enable;

const initFromSearchParams = (locationSearch: string) => {
  locationSearch = locationSearch.startsWith("?")
    ? locationSearch.substr(1)
    : locationSearch;
  const params = qs.parse(locationSearch);

  for (const [param, value] of Object.entries(params)) {
    if (param.startsWith(FLAG_PREFIX) && typeof value === "string") {
      try {
        flag(
          param.substring(FLAG_PREFIX.length) as FlagName,
          JSON.parse(value)
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
};

export const isVercelPreviewHost = (host: string) => {
  return !!/visualization\-tool.*ixt1\.vercel\.app/.exec(host);
};

const initFromHost = (host: string) => {
  // @ts-ignore
  const setDefaultFlag = (name: FlagName, value: FlagValue) => {
    const flagValue = flag(name);

    if (flagValue === null) {
      flag(name, value);
    }
  };
  const shouldSetDefaultFlags =
    host.includes("localhost") ||
    host.includes("test.visualize.admin.ch") ||
    isVercelPreviewHost(host);

  if (shouldSetDefaultFlags) {
    flag("wmts-show-extra-info", true);
  }
};

if (isRunningInBrowser()) {
  // @ts-ignore
  window.flag = flag;
  initFromSearchParams(window.location.search);
  initFromHost(window.location.host);
}
