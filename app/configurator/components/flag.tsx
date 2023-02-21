import qs from "qs";

import { isRunningInBrowser } from "@/utils/is-running-in-browser";

const FLAG_PREFIX = "flag__";

export const flag = (name: string, value?: any) => {
  if (typeof window === "undefined") {
    return false;
  }
  const flagName = `${FLAG_PREFIX}${name}`;
  if (value !== undefined) {
    localStorage.setItem(flagName, JSON.stringify(value));
  } else {
    const stored = localStorage.getItem(flagName);
    return stored ? JSON.parse(stored) : null;
  }
};

const initFromSearchParams = (locationSearch: string) => {
  locationSearch = locationSearch.startsWith("?")
    ? locationSearch.substr(1)
    : locationSearch;
  const params = qs.parse(locationSearch);
  for (const [param, value] of Object.entries(params)) {
    if (param.startsWith(FLAG_PREFIX) && typeof value === "string") {
      try {
        flag(param.substr(FLAG_PREFIX.length), JSON.parse(value));
      } catch (e) {
        console.error(e);
      }
    }
  }
};

if (isRunningInBrowser()) {
  // @ts-ignore
  window.flag = flag;
  initFromSearchParams(window.location.search);
}
