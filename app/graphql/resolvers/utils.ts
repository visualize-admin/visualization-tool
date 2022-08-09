export type DataSourceType = "sparql" | "sql";

export type DataSource = {
  type: DataSourceType;
  url: string;
};

export const retrieveEndpointFromLocalStorage = () => {};

export const convertEndpointToSource = (endpoint: string): DataSource => {
  const [type, url] = endpoint.split("+") as [DataSourceType, string];

  return { type, url };
};

export const convertSourceToEndpoint = (source: DataSource): string => {
  const { type, url } = source;

  return `${type}+${url}`;
};
