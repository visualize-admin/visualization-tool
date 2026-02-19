import { SOURCE_OPTIONS } from "@/domain/data-source/constants";

const whitelistedSources = JSON.parse(
  process.env.WHITELISTED_DATA_SOURCES ?? "[]"
);

const allowedSources = SOURCE_OPTIONS.filter((o) =>
  whitelistedSources.includes(o.key)
);

const allowedDataSourceUrls = allowedSources.map((o) => o.value.split("+")[1]);

export type DataSourceUrl = string & {};

export const isDataSourceUrlAllowed = (url: string): url is DataSourceUrl => {
  return typeof url === "string" && allowedDataSourceUrls.includes(url);
};
