import { ConfiguratorState } from "@/config-types";

const LOCALSTORAGE_PREFIX = "vizualize-configurator-state";
export const getLocalStorageKey = (chartId: string) =>
  `${LOCALSTORAGE_PREFIX}:${chartId}`;

export const saveChartLocally = (chartId: string, state: ConfiguratorState) => {
  window.localStorage.setItem(
    getLocalStorageKey(chartId),
    JSON.stringify(state)
  );
  return;
};
