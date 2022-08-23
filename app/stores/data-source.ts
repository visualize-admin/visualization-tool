import Router from "next/router";
import create, { StateCreator, StoreApi } from "zustand";

import { DataSource } from "@/configurator";
import {
  DEFAULT_DATA_SOURCE,
  parseDataSource,
  parseSourceByLabel,
  sourceToLabel,
  stringifyDataSource,
} from "@/domain/datasource";
import { isRunningInBrowser } from "@/lib/is-running-in-browser";
import { getURLParam } from "@/lib/router/helpers";

type DataSourceStore = {
  dataSource: DataSource;
  setDataSource: (value: string) => void;
};

const PARAM_KEY = "dataSource";

const saveToLocalStorage = (value: DataSource) => {
  localStorage.setItem(PARAM_KEY, stringifyDataSource(value));
};

const updateRouterDataSourceParam = (dataSource: DataSource) => {
  const urlDataSourceLabel = getURLParam(PARAM_KEY);
  const dataSourceLabel = sourceToLabel(dataSource);

  if (urlDataSourceLabel !== dataSourceLabel) {
    Router.replace({
      pathname: Router.pathname,
      query: { ...Router.query, [PARAM_KEY]: dataSourceLabel },
    });
  }
};

/**
 * Custom middleware that saves data source to localStorage.
 *
 * On initialization it tries to first retrieve data source from URL; if it's
 * not here, tries with localStorage, otherwise uses a default data source.
 */
const dataSourceStoreMiddleware =
  (config: StateCreator<DataSourceStore>) =>
  (
    set: StoreApi<DataSourceStore>["setState"],
    get: StoreApi<DataSourceStore>["getState"],
    api: StoreApi<DataSourceStore>
  ) => {
    const state = config(
      (payload: DataSourceStore) => {
        set(payload);

        if (isRunningInBrowser()) {
          saveToLocalStorage(payload.dataSource);
          updateRouterDataSourceParam(get().dataSource);
        }
      },
      get,
      api,
      []
    );

    let dataSource = DEFAULT_DATA_SOURCE;

    if (isRunningInBrowser()) {
      const urlDataSourceLabel = getURLParam(PARAM_KEY);
      const urlDataSource = urlDataSourceLabel
        ? parseSourceByLabel(urlDataSourceLabel)
        : undefined;

      if (urlDataSourceLabel && urlDataSource) {
        dataSource = urlDataSource;
        saveToLocalStorage(urlDataSource);
      } else {
        const storageDataSource = localStorage.getItem(PARAM_KEY);

        if (storageDataSource) {
          dataSource = parseDataSource(storageDataSource);
        } else {
          saveToLocalStorage(dataSource);
        }
      }
    }

    const callback = () => updateRouterDataSourceParam(get().dataSource);

    // No need to unsubscribe, as store is created once and needs to update
    // URL continously.
    Router.events.on("routeChangeComplete", callback);

    // Initialize with correct url.
    Router.ready(callback);

    return { ...state, dataSource };
  };

export const useDataSourceStore = create<DataSourceStore>(
  dataSourceStoreMiddleware((set) => ({
    dataSource: DEFAULT_DATA_SOURCE,
    setDataSource: (value) => {
      set({ dataSource: parseDataSource(value) });
    },
  }))
);
