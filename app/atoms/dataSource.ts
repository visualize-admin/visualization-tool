import { atomWithStorage } from "jotai/utils";
import Router from "next/router";

import { DataSource } from "@/configurator";
import {
  parseDataSource,
  stringifyDataSource,
} from "@/domain/data-source/helpers";
import { getURLParam } from "@/lib/router-helpers";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

const getItem = () => {
  const urlSource = getURLParam("dataSource");
  if (urlSource) {
    return parseDataSource(urlSource);
  }
  const storageSource = localStorage.getItem("dataSource");
  if (storageSource) {
    return parseDataSource(storageSource);
  }
  return DEFAULT_DATA_SOURCE;
};

const setItem = (key: string, value: DataSource) => {
  const stringifiedValue = stringifyDataSource(value);
  localStorage.setItem(key, stringifiedValue);
};

const removeItem = () => {};

const subscribe = () => {
  const callback = () => {
    const urlSource = getURLParam("dataSource");
    if (urlSource) {
      return setItem("dataSource", parseDataSource(urlSource));
    }
    const storageValue = localStorage.getItem("dataSource");
    if (storageValue) {
      return setItem("dataSource", parseDataSource(storageValue));
    }
    return setItem("dataSource", DEFAULT_DATA_SOURCE);
  };
  Router.events.on("routeChangeComplete", callback);
  return () => {
    Router.events.off("routeChangeComplete", callback);
  };
};

export const dataSourceAtom = atomWithStorage<DataSource>(
  "dataSource",
  DEFAULT_DATA_SOURCE,
  {
    getItem,
    setItem,
    removeItem,
    subscribe,
  }
);
