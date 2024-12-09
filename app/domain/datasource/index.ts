import { useMemo } from "react";

import { DataSource } from "@/config-types";
import { getURLParam } from "@/utils/router/helpers";
import { useRouteState } from "@/utils/router/use-route-state";
import useEvent from "@/utils/use-event";

import { ENDPOINT } from "../env";

import { SOURCES_BY_LABEL, SOURCES_BY_VALUE } from "./constants";
import {
  retrieveDataSourceFromLocalStorage,
  saveDataSourceToLocalStorage,
} from "./localStorage";

export { isDataSourceUrlAllowed, type DataSourceUrl } from "./urls";

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

export const useDataSourceState = () => {
  const [source, setSource] = useRouteState(
    () => {
      // Cannot use next router here as it is initialized asynchronously
      const urlParam = getURLParam("dataSource");

      // Priority for initial state: URL -> localStorage -> default
      return (
        (urlParam && parseSourceByLabel(urlParam)) ||
        retrieveDataSourceFromLocalStorage() ||
        DEFAULT_DATA_SOURCE
      );
    },
    {
      param: "dataSource",
      deserialize: (l) => parseSourceByLabel(l) ?? DEFAULT_DATA_SOURCE,
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
