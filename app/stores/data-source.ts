import Router, { SingletonRouter } from "next/router";
import create, { StateCreator, StoreApi } from "zustand";

import { DataSource } from "@/configurator";
import {
  DEFAULT_DATA_SOURCE,
  parseSourceByLabel,
  sourceToLabel,
} from "@/domain/data-source";
import { isRunningInBrowser } from "@/utils/is-running-in-browser";
import { getURLParam, setURLParam } from "@/utils/router/helpers";

type DataSourceStore = {
  dataSource: DataSource;
  setDataSource: (value: DataSource) => void;
};

const PARAM_KEY = "dataSource";

const saveToLocalStorage = (value: DataSource) => {
  try {
    localStorage.setItem(PARAM_KEY, sourceToLabel(value));
  } catch (error) {
    console.error("Error saving data source to localStorage", error);
  }
};

export const getDataSourceFromLocalStorage = () => {
  try {
    const dataSourceLabel = localStorage.getItem(PARAM_KEY);

    if (dataSourceLabel) {
      return parseSourceByLabel(dataSourceLabel);
    }
  } catch (error) {
    console.error("Error getting data source from localStorage", error);
  }
};

const shouldKeepSourceInURL = (pathname: string) => {
  return !pathname.includes("__test");
};

const saveToURL = (dataSource: DataSource) => {
  const urlDataSourceLabel = getURLParam(PARAM_KEY);
  const dataSourceLabel = sourceToLabel(dataSource);

  if (urlDataSourceLabel !== dataSourceLabel) {
    setURLParam(PARAM_KEY, dataSourceLabel);
  }
};

/**
 * Custom middleware that saves data source to localStorage.
 *
 * On initialization it tries to first retrieve data source from the
 * URL (stored as label: Prod, Int, Test); if it's not here, tries with
 * localStorage (also stored as label), otherwise uses a default data source.
 */
const dataSourceStoreMiddleware =
  (config: StateCreator<DataSourceStore>, router: SingletonRouter) =>
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
          saveToURL(payload.dataSource);
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
        const storageDataSource = getDataSourceFromLocalStorage();

        if (storageDataSource) {
          dataSource = storageDataSource;
        } else {
          saveToLocalStorage(dataSource);
        }
      }
    }

    const callback = () => {
      const newSource = get()?.dataSource;

      if (newSource && shouldKeepSourceInURL(router.pathname)) {
        saveToURL(newSource);
      }
    };

    // No need to unsubscribe, as store is created once and needs to update
    // URL continuously.
    router.events.on("routeChangeComplete", callback);

    // Initialize with correct url.
    router.ready(callback);

    return { ...state, dataSource };
  };

export const createUseDataSourceStore = (router: SingletonRouter) =>
  create<DataSourceStore>(
    dataSourceStoreMiddleware(
      (set) => ({
        dataSource: DEFAULT_DATA_SOURCE,
        setDataSource: (value) => set({ dataSource: value }),
      }),
      router
    )
  );

export const useDataSourceStore = createUseDataSourceStore(Router);
