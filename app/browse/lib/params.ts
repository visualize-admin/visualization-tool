import { ParsedUrlQuery } from "querystring";

import mapValues from "lodash/mapValues";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import NextLink from "next/link";
import { Router } from "next/router";
import { ComponentProps } from "react";

import { truthy } from "@/domain/types";
import { BrowseParams } from "@/pages/browse";

export const getBrowseParamsFromQuery = (
  query: Router["query"]
): BrowseParams => {
  const rawValues = mapValues(
    pick(query, [
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
    ]),
    (v) => (Array.isArray(v) ? v[0] : v)
  );

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
  } = rawValues;
  const previous = values.previous ? JSON.parse(values.previous) : undefined;

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
      includeDrafts: includeDrafts ? JSON.parse(includeDrafts) : undefined,
    },
    (x) => x !== undefined
  );
};

export const buildURLFromBrowseParams = ({
  type,
  iri,
  subtype,
  subiri,
  subsubtype,
  subsubiri,
  ...queryParams
}: BrowseParams): ComponentProps<typeof NextLink>["href"] => {
  const typePart =
    type && iri
      ? `${encodeURIComponent(type)}/${encodeURIComponent(iri)}`
      : undefined;
  const subtypePart =
    subtype && subiri
      ? `${encodeURIComponent(subtype)}/${encodeURIComponent(subiri)}`
      : undefined;
  const subsubtypePart =
    subsubtype && subsubiri
      ? `${encodeURIComponent(subsubtype)}/${encodeURIComponent(subsubiri)}`
      : undefined;
  const pathname = ["/browse", typePart, subtypePart, subsubtypePart]
    .filter(truthy)
    .join("/");

  return {
    pathname,
    query: queryParams,
  } satisfies ComponentProps<typeof NextLink>["href"];
};

export const extractParamFromPath = (path: string, param: string) => {
  return path.match(new RegExp(`[&?]${param}=(.*?)(&|$)`));
};

export const isOdsIframe = (query: ParsedUrlQuery) => {
  return query["odsiframe"] === "true";
};
