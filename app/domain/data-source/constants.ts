import keyBy from "lodash/keyBy";

import { WHITELISTED_DATA_SOURCES } from "../env";

export const LEGACY_PROD_DATA_SOURCE_URL = "https://lindas.admin.ch/query";

export const PROD_DATA_SOURCE_URL =
  "https://lindas-cached.cluster.ldbar.ch/query";

export const SOURCE_OPTIONS = [
  {
    value: `sparql+${PROD_DATA_SOURCE_URL}`,
    label: "Prod",
    url: PROD_DATA_SOURCE_URL,
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas.admin.ch/query",
    label: "Prod-uncached",
    url: "https://lindas.admin.ch/query",
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas-cached.int.cz-aws.net/query",
    label: "Int",
    url: "https://lindas-cached.int.cz-aws.net/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas.int.cz-aws.net/query",
    label: "Int-uncached",
    url: "https://lindas.int.cz-aws.net/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas-cached.test.cz-aws.net/query",
    label: "Test",
    url: "https://lindas-cached.test.cz-aws.net/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://lindas.test.cz-aws.net/query",
    label: "Test-uncached",
    url: "https://lindas.test.cz-aws.net/query",
    isTrusted: false,
    supportsCachingPerCubeIri: true,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.label));

export const SOURCES_BY_LABEL = keyBy(SOURCE_OPTIONS, (d) => d.label);
export const SOURCES_BY_VALUE = keyBy(SOURCE_OPTIONS, (d) => d.value);
export const SOURCES_BY_URL = keyBy(SOURCE_OPTIONS, (d) => d.url);
