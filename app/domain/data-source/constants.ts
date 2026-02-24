import keyBy from "lodash/keyBy";

import { WHITELISTED_DATA_SOURCES } from "../env";

export const LEGACY_PROD_DATA_SOURCE_URL = "https://lindas.admin.ch/query";

export const PROD_DATA_SOURCE_URL =
  "https://lindas-cached.cluster.ldbar.ch/query";

interface SourceOption {
  value: string;
  key: string;
  label: string;
  url: string;
  isTrusted: boolean;
  supportsCachingPerCubeIri: boolean;
}

export const SOURCE_OPTIONS: SourceOption[] = [
  {
    value: `sparql+${PROD_DATA_SOURCE_URL}`,
    key: "Prod",
    label: "LINDAS PROD",
    url: PROD_DATA_SOURCE_URL,
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas.admin.ch/query",
    key: "Prod-uncached",
    label: "LINDAS PROD (uncached)",
    url: "https://lindas.admin.ch/query",
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },

  // For LINDASnext
  {
    value: "sparql+https://cached.lindas.admin.ch/query",
    key: "LINDASnext-Prod",
    label: "LINDASnext PROD",
    url: "https://cached.lindas.admin.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas.cz-aws.net/query",
    key: "LINDASnext-Prod-uncached",
    label: "LINDASnext PROD (uncached)",
    url: "https://lindas.cz-aws.net/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  // Migration done for the following data sources
  {
    value: "sparql+https://int.cached.lindas.admin.ch/query",
    key: "Int",
    label: "LINDASnext INT",
    url: "https://int.cached.lindas.admin.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    key: "Int-uncached",
    label: "LINDASnext INT (uncached)",
    url: "https://int.lindas.admin.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://test.cached.lindas.admin.ch/query",
    key: "Test",
    label: "LINDASnext TEST",
    url: "https://test.cached.lindas.admin.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://test.lindas.admin.ch/query",
    key: "Test-uncached",
    label: "LINDASnext TEST (uncached)",
    url: "https://test.lindas.admin.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },

  // For LINDASold
  {
    value: "sparql+https://lindas-cached.int.cluster.ldbar.ch/query",
    key: "LINDASold-Int",
    label: "LINDASold INT",
    url: "https://lindas-cached.int.cluster.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://old.int.ld.ldbar.ch/query",
    key: "LINDASold-Int-uncached",
    label: "LINDASold INT (uncached)",
    url: "https://old.int.ld.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas-cached.test.cluster.ldbar.ch/query",
    key: "LINDASold-Test",
    label: "LINDASold TEST",
    url: "https://lindas-cached.test.cluster.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://old.test.ld.ldbar.ch/query",
    key: "LINDASold-Test-uncached",
    label: "LINDASold TEST (uncached)",
    url: "https://old.test.ld.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.key));

export const SOURCES_BY_KEY = keyBy(SOURCE_OPTIONS, (d) => d.key);
export const SOURCES_BY_VALUE = keyBy(SOURCE_OPTIONS, (d) => d.value);
export const SOURCES_BY_URL = keyBy(SOURCE_OPTIONS, (d) => d.url);
