import { atomWithStorage } from "jotai/utils";
import Router from "next/router";

import { DataSource } from "@/configurator";
import {
  getDataSourceFromURLOrLocalStorage,
  stringifyDataSource,
} from "@/domain/data-source/helpers";
import { updateRouterQuery } from "@/lib/router-helpers";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

const getItem = () => {
  return getDataSourceFromURLOrLocalStorage() || DEFAULT_DATA_SOURCE;
};

const setItem = (key: string, value: DataSource) => {
  const stringifiedValue = stringifyDataSource(value);
  localStorage.setItem(key, stringifiedValue);
  updateRouterQuery(Router, { dataSource: stringifiedValue });
};

const removeItem = () => {};

export const dataSourceAtom = atomWithStorage<DataSource>(
  "dataSource",
  DEFAULT_DATA_SOURCE,
  {
    getItem,
    setItem,
    removeItem,
  }
);
