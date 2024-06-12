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
    position: 3,
    isTrusted: true,
    supportsCachingPerCubeIri: true,
  },
  {
    value: "sparql+https://int.lindas.admin.ch/query",
    label: "Int",
    url: "https://int.lindas.admin.ch/query",
    position: 2,
    isTrusted: false,
    supportsCachingPerCubeIri: false,
  },
  {
    value: "sparql+https://test.lindas.admin.ch/query",
    label: "Test",
    url: "https://test.lindas.admin.ch/query",
    position: 1,
    isTrusted: false,
    supportsCachingPerCubeIri: false,
  },
].filter((d) => WHITELISTED_DATA_SOURCES.includes(d.label));

export const SOURCES_BY_LABEL = keyBy(SOURCE_OPTIONS, (d) => d.label);
export const SOURCES_BY_VALUE = keyBy(SOURCE_OPTIONS, (d) => d.value);
