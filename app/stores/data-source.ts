import create, { StateCreator, StoreApi } from "zustand";

import { DataSource } from "@/configurator";
import {
  DEFAULT_DATA_SOURCE,
  getURLParam,
  parseDataSource,
  stringifyDataSource,
} from "@/domain/datasource";
import { isRunningInBrowser } from "@/lib/is-running-in-browser";

type DataSourceStore = {
  dataSource: DataSource;
  setDataSource: (value: string) => void;
};

const customPersist =
  (name: string, config: StateCreator<DataSourceStore>) =>
  (
    set: StoreApi<DataSourceStore>["setState"],
    get: StoreApi<DataSourceStore>["getState"],
    api: StoreApi<DataSourceStore>
  ) => {
    const state = config(
      (payload: DataSourceStore) => {
        set(payload);

        if (isRunningInBrowser()) {
          localStorage.setItem(name, stringifyDataSource(payload.dataSource));
        }
      },
      get,
      api,
      []
    );

    let dataSource = DEFAULT_DATA_SOURCE;

    if (isRunningInBrowser()) {
      const urlDataSource = getURLParam("dataSource");
      if (urlDataSource) {
        dataSource = parseDataSource(urlDataSource);
        localStorage.setItem(name, urlDataSource);
      } else {
        const storageDataSource = localStorage.getItem(name);
        if (storageDataSource) {
          dataSource = parseDataSource(storageDataSource);
        }
      }
    }

    return { ...state, dataSource };
  };

export const useDataSourceStore = create<DataSourceStore>(
  customPersist("dataSource", (set) => ({
    dataSource: DEFAULT_DATA_SOURCE,
    setDataSource: (value) => {
      set({ dataSource: parseDataSource(value) });
    },
  }))
);
