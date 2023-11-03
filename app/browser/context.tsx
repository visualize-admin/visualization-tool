import { ParsedUrlQuery } from "querystring";

import mapValues from "lodash/mapValues";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import { SearchCubeResultOrder } from "@/graphql/query-hooks";
import { BrowseParams } from "@/pages/browse";
import useEvent from "@/utils/use-event";

import { getFiltersFromParams } from "./filters";

export const getBrowseParamsFromQuery = (query: Router["query"]) => {
  const rawValues = mapValues(
    pick(query, [
      "type",
      "iri",
      "subtype",
      "subiri",
      "topic",
      "includeDrafts",
      "order",
      "search",
      "dataset",
      "previous",
    ]),
    (v) => (Array.isArray(v) ? v[0] : v)
  );

  const { type, iri, subtype, subiri, topic, includeDrafts, ...values } =
    rawValues;
  const previous = values.previous ? JSON.parse(values.previous) : undefined;

  return pickBy(
    {
      ...values,
      type: type ?? previous?.type,
      iri: iri ?? previous?.iri,
      subtype: subtype ?? previous?.subtype,
      subiri: subiri ?? previous?.subiri,
      topic: topic ?? previous?.topic,
      includeDrafts: includeDrafts ? JSON.parse(includeDrafts) : undefined,
    },
    (x) => x !== undefined
  );
};

export const buildURLFromBrowseState = (browseState: BrowseParams) => {
  const { type, iri, subtype, subiri, ...queryParams } = browseState;

  const typePart =
    type && iri
      ? `${encodeURIComponent(type)}/${encodeURIComponent(iri)}`
      : undefined;
  const subtypePart =
    subtype && subiri
      ? `${encodeURIComponent(subtype)}/${encodeURIComponent(subiri)}`
      : undefined;

  const pathname = ["/browse", typePart, subtypePart].filter(Boolean).join("/");
  return {
    pathname,
    query: queryParams,
  } as React.ComponentProps<typeof Link>["href"];
};
const extractParamFromPath = (path: string, param: string) =>
  path.match(new RegExp(`[&?]${param}=(.*?)(&|$)`));
const useQueryParamsState = <T extends object>(
  initialState: T,
  {
    serialize,
    parse,
  }: {
    serialize: (s: T) => Parameters<typeof router.replace>[0];
    parse: (s: ParsedUrlQuery) => T;
  }
) => {
  const router = useRouter();

  const [state, rawSetState] = useState(() => {
    // Rely directly on window instead of router since router takes a bit of time
    // to be initialized
    const sp =
      typeof window !== "undefined"
        ? new URL(window.location.href).searchParams
        : undefined;
    const dataset = extractParamFromPath(router.asPath, "dataset");
    const query = sp ? Object.fromEntries(sp.entries()) : undefined;

    if (dataset && query && !query.dataset) {
      query.dataset = dataset[0];
    }

    return query ? parse(query) : initialState;
  });

  useEffect(() => {
    if (router.isReady) {
      rawSetState(parse(router.query));
    }
  }, [parse, router.isReady, router.query]);

  const setState = useEvent((stateUpdate: T) => {
    rawSetState((curState) => {
      const newState = { ...curState, ...stateUpdate } as T;
      router.replace(serialize(newState), undefined, {
        shallow: true,
      });
      return newState;
    });
  });
  return [state, setState] as const;
};

export const useBrowseState = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [browseParams, setParams] = useQueryParamsState(
    {},
    {
      parse: getBrowseParamsFromQuery,
      serialize: buildURLFromBrowseState,
    }
  );
  const {
    search,
    type,
    order,
    iri,
    includeDrafts,
    dataset: paramDataset,
  } = browseParams;

  // Support /browse?dataset=<iri> and legacy /browse/dataset/<iri>
  const dataset = type === "dataset" ? iri : paramDataset;
  const filters = getFiltersFromParams(browseParams);

  const setSearch = useEvent((v: string) => setParams({ search: v }));
  const setIncludeDrafts = useEvent((v: boolean) =>
    setParams({ includeDrafts: v })
  );
  const setOrder = useEvent((v: SearchCubeResultOrder) =>
    setParams({ order: v })
  );
  const setDataset = useEvent((v: string) => setParams({ dataset: v }));

  const previousOrderRef = useRef<SearchCubeResultOrder>(
    SearchCubeResultOrder.Score
  );

  return useMemo(
    () => ({
      inputRef,
      includeDrafts: !!includeDrafts,
      setIncludeDrafts,
      onReset: () => {
        setParams({ search: "", order: SearchCubeResultOrder.CreatedDesc });
      },
      onSubmitSearch: (newSearch: string) => {
        setParams({
          search: newSearch,
          order:
            newSearch === ""
              ? SearchCubeResultOrder.CreatedDesc
              : previousOrderRef.current,
        });
      },
      search,
      order,
      onSetOrder: (order: SearchCubeResultOrder) => {
        previousOrderRef.current = order;
        setOrder(order);
      },
      setSearch,
      setOrder,
      dataset,
      setDataset,
      filters,
    }),
    [
      includeDrafts,
      setIncludeDrafts,
      search,
      order,
      setSearch,
      setOrder,
      dataset,
      setDataset,
      filters,
      setParams,
    ]
  );
};

export type BrowseState = ReturnType<typeof useBrowseState>;
const BrowseContext = React.createContext<BrowseState | undefined>(undefined);
/**
 * Provides browse context to children below
 * Responsible for connecting the router to the browsing state
 */

export const BrowseStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const browseState = useBrowseState();
  return (
    <BrowseContext.Provider value={browseState}>
      {children}
    </BrowseContext.Provider>
  );
};

export const useBrowseContext = () => {
  const ctx = useContext(BrowseContext);
  if (!ctx) {
    throw new Error(
      "To be able useBrowseContext, you must wrap it into a BrowseStateProvider"
    );
  }
  return ctx;
};
