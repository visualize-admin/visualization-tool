import { DataSource } from "@/configurator";

export const retrieveStringifiedDataSourceFromLocalStorage = () => {
  return localStorage.getItem("dataSource");
};

export const retrieveDataSourceFromLocalStorage = () => {
  const dataSource = retrieveStringifiedDataSourceFromLocalStorage();

  if (dataSource) {
    return parseDataSource(dataSource);
  }

  return null;
};

export const saveDataSourceToLocalStorage = (dataSource: DataSource) => {
  localStorage.setItem("dataSource", stringifyDataSource(dataSource));
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
