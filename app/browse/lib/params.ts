import { ParsedUrlQuery } from "querystring";

import mapValues from "lodash/mapValues";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import NextLink from "next/link";
import { Router } from "next/router";
import { ComponentProps } from "react";

import { truthy } from "@/domain/types";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";

const params = [
  "type",
  "iri",
  "subtype",
  "subiri",
  "subsubtype",
  "subsubiri",
  "topic",
  "includeDrafts",
  "order",
  "search",
  "dataset",
  "previous",
] as const;

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset" | "termset";
  iri?: string;
  subtype?: "theme" | "organization" | "termset";
  subiri?: string;
  subsubtype?: "theme" | "organization" | "termset";
  subsubiri?: string;
  topic?: string;
  includeDrafts?: boolean;
  order?: SearchCubeResultOrder;
  search?: string;
  dataset?: string;
  previous?: string;
};

export const getBrowseParamsFromQuery = (
  query: Router["query"]
): BrowseParams => {
  const {
    type,
    iri,
    subtype,
    subiri,
    subsubtype,
    subsubiri,
    topic,
    includeDrafts,
    ...values
  } = mapValues(pick(query, params), (v) => (Array.isArray(v) ? v[0] : v));
  const previous: BrowseParams | undefined = values.previous
    ? JSON.parse(values.previous)
    : undefined;

  return pickBy(
    {
      ...values,
      type: type ?? previous?.type,
      iri: iri ?? previous?.iri,
      subtype: subtype ?? previous?.subtype,
      subiri: subiri ?? previous?.subiri,
      subsubtype: subsubtype ?? previous?.subsubtype,
      subsubiri: subsubiri ?? previous?.subsubiri,
      topic: topic ?? previous?.topic,
      includeDrafts: includeDrafts ?? previous?.includeDrafts,
    },
    (d) => d !== undefined
  );
};

export const buildURLFromBrowseParams = ({
  type,
  iri,
  subtype,
  subiri,
  subsubtype,
  subsubiri,
  ...query
}: BrowseParams): ComponentProps<typeof NextLink>["href"] => {
  const typePart = buildQueryPart(type, iri);
  const subtypePart = buildQueryPart(subtype, subiri);
  const subsubtypePart = buildQueryPart(subsubtype, subsubiri);
  const pathname = ["/browse", typePart, subtypePart, subsubtypePart]
    .filter(truthy)
    .join("/");

  return { pathname, query };
};

const buildQueryPart = (type: string | undefined, iri: string | undefined) => {
  if (!type || !iri) {
    return undefined;
  }

  return `${encodeURIComponent(type)}/${encodeURIComponent(iri)}`;
};

export const extractParamFromPath = (path: string, param: string) => {
  return path.match(new RegExp(`[&?]${param}=(.*?)(&|$)`));
};

export const isOdsIframe = (query: ParsedUrlQuery) => {
  return query["odsiframe"] === "true";
};
