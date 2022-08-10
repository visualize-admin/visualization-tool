export type DataSourceType = "sparql" | "sql";

export type DataSource = {
  type: DataSourceType;
  url: string;
};

export const retrieveDataSourceFromLocalStorage = () => {
  return localStorage.getItem("dataSource");
};

export const saveDataSourceToLocalStorage = (dataSource: string) => {
  localStorage.setItem("dataSource", dataSource);
};

export const parseDataSource = (stringifiedSource: string): DataSource => {
  const [type, url] = stringifiedSource.split("+") as [DataSourceType, string];

  return { type, url };
};

export const stringifyDataSource = (source: DataSource): string => {
  const { type, url } = source;

  return `${type}+${url}`;
};
