import keyBy from "lodash/keyBy";

import { WHITELISTED_DATA_SOURCES } from "../env";

export const UNCACHED_PROD_DATA_SOURCE_URL = "https://lindas.admin.ch/query";

export const PROD_DATA_SOURCE_URL = "https://cached.lindas.admin.ch/query";

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
    label: "LINDASnext PROD",
    url: PROD_DATA_SOURCE_URL,
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
  {
    value: `sparql+${UNCACHED_PROD_DATA_SOURCE_URL}`,
    key: "Prod-uncached",
    label: "LINDASnext PROD (uncached)",
    url: UNCACHED_PROD_DATA_SOURCE_URL,
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
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
    value: "sparql+https://lindas-cached.cluster.ldbar.ch/query",
    key: "LINDASold-Prod",
    label: "LINDASold PROD",
    url: "https://lindas-cached.cluster.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://old.ld.ldbar.ch/query",
    key: "LINDASold-Prod-uncached",
    label: "LINDASold PROD (uncached)",
    url: "https://old.ld.ldbar.ch/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
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
