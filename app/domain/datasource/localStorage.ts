import { DataSource } from "@/config-types";

import { parseDataSource, stringifyDataSource } from ".";

export const retrieveStringifiedDataSourceFromLocalStorage = () => {
  return localStorage.getItem("dataSource");
};

export const retrieveDataSourceFromLocalStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const dataSource = retrieveStringifiedDataSourceFromLocalStorage();

  if (dataSource) {
    return parseDataSource(dataSource);
  }

  return null;
};

export const saveDataSourceToLocalStorage = (dataSource: DataSource) => {
  localStorage.setItem("dataSource", stringifyDataSource(dataSource));
};
