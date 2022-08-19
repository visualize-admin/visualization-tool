import { keyBy } from "lodash";
import { useMemo } from "react";

import { DataSource } from "@/configurator";
import { getLocalStorageItem } from "@/lib/local-storage-helpers";
import { getURLParam } from "@/lib/router-helpers";

import { WHITELISTED_DATA_SOURCES } from "../env";

export const getDataSourceFromURLOrLocalStorage = () => {
  const urlSource = getURLParam("dataSource");
  if (urlSource) {
    return parseDataSource(urlSource);
  }
  const storageSource = getLocalStorageItem("dataSource");
  if (storageSource) {
    return parseDataSource(storageSource);
  }
};

export const SOURCE_OPTIONS = [
  {
    value: "sparql+https://lindas.admin.ch/query",
    label: "Prod",
    position: 3,
    isTrusted: true,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "Int",
    position: 2,
    isTrusted: false,
  },
  {
    value: "sparql+https://test.lindas.admin.ch/query",
    label: "Test",
    position: 1,
    isTrusted: false,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.label));

export const SOURCES_BY_LABEL = keyBy(SOURCE_OPTIONS, (d) => d.label);
export const SOURCES_BY_VALUE = keyBy(SOURCE_OPTIONS, (d) => d.value);

export const useIsTrustedDataSource = (dataSource: DataSource) => {
  return useMemo(() => {
    const stringifiedDataSource = stringifyDataSource(dataSource);
    return SOURCES_BY_VALUE[stringifiedDataSource]?.isTrusted;
  }, [dataSource]);
};

export const isDataSourceChangeable = (pathname: string) => {
  if (pathname === "/" || pathname === "/browse") {
    return true;
  } else {
    return false;
  }
};

export const parseDataSource = (stringifiedSource: string): DataSource => {
  const [type, url] = stringifiedSource.split("+") as [
    DataSource["type"],
    string
  ];

  return { type, url };
};

export const stringifyDataSource = (source: DataSource): string => {
  const { type, url } = source;

  return `${type}+${url}`;
};
