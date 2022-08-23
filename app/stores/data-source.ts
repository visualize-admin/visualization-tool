import create, { StateCreator, StoreApi } from "zustand";

import { DataSource } from "@/configurator";
import {
  DEFAULT_DATA_SOURCE,
  parseDataSource,
  parseSourceByLabel,
  stringifyDataSource,
} from "@/domain/datasource";
import { isRunningInBrowser } from "@/lib/is-running-in-browser";
import { getURLParam } from "@/lib/router/helpers";

type DataSourceStore = {
  dataSource: DataSource;
  setDataSource: (value: string) => void;
};

const STORAGE_KEY = "dataSource";

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
          localStorage.setItem(
            STORAGE_KEY,
            stringifyDataSource(payload.dataSource)
          );
        }
      },
      get,
      api,
      []
    );

    let dataSource = DEFAULT_DATA_SOURCE;

    // Triggered on init.
    if (isRunningInBrowser()) {
      const urlDataSourceLabel = getURLParam("dataSource");
      const urlDataSource = urlDataSourceLabel
        ? parseSourceByLabel(urlDataSourceLabel)
        : undefined;

      if (urlDataSourceLabel && urlDataSource) {
        dataSource = urlDataSource;
        localStorage.setItem(STORAGE_KEY, stringifyDataSource(urlDataSource));
      } else {
        const storageDataSource = localStorage.getItem(STORAGE_KEY);

        if (storageDataSource) {
          dataSource = parseDataSource(storageDataSource);
        } else {
          localStorage.setItem(STORAGE_KEY, stringifyDataSource(dataSource));
        }
      }
    }

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
