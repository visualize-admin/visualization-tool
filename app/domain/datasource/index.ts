import { useContext, createContext, Dispatch, useMemo } from "react";

import { DataSource } from "@/configurator/config-types";
import useEvent from "@/lib/use-event";
import { useRouteState } from "@/lib/use-route-state";

import { ENDPOINT } from "../env";

import { SOURCES_BY_VALUE, SOURCES_BY_LABEL } from "./constants";
import {
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
} from "./localStorage";

export const parseDataSource = (stringifiedSource: string): DataSource => {
  const [type, url] = stringifiedSource.split("+") as [
    DataSource["type"],
    string
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

export const DataSourceStateContext = createContext<
  { dataSource: DataSource; setDataSource: Dispatch<string> } | undefined
>(undefined);

export const useDataSource = () => {
  const ctx = useContext(DataSourceStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap the application in <DataSourceProvider /> to useDataSource()"
    );
  }

  return ctx;
};

export const parseSourceByLabel = (label: string): DataSource | undefined => {
  const newSource = SOURCES_BY_LABEL[label];
  return newSource ? parseDataSource(newSource.value) : undefined;
};

export const sourceToLabel = (source: DataSource) => {
  return SOURCES_BY_VALUE[stringifyDataSource(source)]?.label;
};

const getURLParam = (param: string) => {
  const url =
    typeof window !== "undefined" ? new URL(window.location.href) : null;
  if (!url) {
    return undefined;
  }
  return url.searchParams.get(param);
};

export const useDataSourceState = () => {
  const [source, setSource] = useRouteState(
    () => {
      // Cannot use next router here as it is initialized asynchronously
      const urlParam = getURLParam("dataSource");

      // Priority for initial state: URL -> localStorage -> default
      const initial =
        (urlParam && parseSourceByLabel(urlParam)) ||
        retrieveDataSourceFromLocalStorage() ||
        DEFAULT_DATA_SOURCE;
      return initial;
    },
    {
      param: "dataSource",
      deserialize: (l) => parseSourceByLabel(l) || DEFAULT_DATA_SOURCE,
      serialize: sourceToLabel,
      onValueChange: (newSource) => {
        saveDataSourceToLocalStorage(newSource);
      },
      shouldValueBeSaved: (item) =>
        !(
          item.type === DEFAULT_DATA_SOURCE.type &&
          item.url === DEFAULT_DATA_SOURCE.url
        ),
    }
  );

  const setSourceByValue = useEvent((sourceValue: string) => {
    setSource(parseDataSource(SOURCES_BY_VALUE[sourceValue]?.value));
  });

  return [source, setSourceByValue] as const;
};
