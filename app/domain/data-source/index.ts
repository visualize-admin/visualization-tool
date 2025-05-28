import { useMemo } from "react";

import { DataSource } from "@/config-types";
import {
  SOURCES_BY_LABEL,
  SOURCES_BY_VALUE,
} from "@/domain/data-source/constants";
import { ENDPOINT } from "@/domain/env";

export { type DataSourceUrl, isDataSourceUrlAllowed } from "./urls";

export const parseDataSource = (stringifiedSource: string): DataSource => {
  const [type, url] = stringifiedSource.split("+") as [
    DataSource["type"],
    string,
  ];

  return { type, url };
};

export const DEFAULT_DATA_SOURCE = parseDataSource(ENDPOINT);

export const stringifyDataSource = (source: DataSource): string => {
  const { type, url } = source;

  return `${type}+${url}`;
};

export const useIsTrustedDataSource = (dataSource: DataSource) => {
  return useMemo(() => {
    const stringifiedDataSource = stringifyDataSource(dataSource);
    return SOURCES_BY_VALUE[stringifiedDataSource]?.isTrusted;
  }, [dataSource]);
};

export const parseSourceByLabel = (label: string): DataSource | undefined => {
  const newSource = SOURCES_BY_LABEL[label];
  return newSource ? parseDataSource(newSource.value) : undefined;
};

export const sourceToLabel = (source: DataSource) => {
  return SOURCES_BY_VALUE[stringifyDataSource(source)]?.label;
};

export const isDataSourceChangeable = (pathname: string) => {
  return ["/", "/browse"].includes(pathname);
};

export const dataSourceToSparqlEditorUrl = (dataSource: DataSource): string => {
  switch (dataSource.type) {
    case "sparql":
      const url = new URL(dataSource.url);
      return `${url.origin}/sparql`;
    case "sql":
      throw Error("Not implemented yet.");
  }
};
