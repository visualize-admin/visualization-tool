import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

const LEGACY_EMBED_QUERY_PARAMS = ["disableBorder"] as const;
type LegacyEmbedQueryParam = (typeof LEGACY_EMBED_QUERY_PARAMS)[number];

const migrateEmbedQueryParam = (
  param: LegacyEmbedQueryParam | EmbedQueryParam
): EmbedQueryParam => {
  switch (param) {
    case "disableBorder":
      return "removeBorder";
    case "optimizeSpace":
    case "removeLabelsInteractivity":
    case "removeBorder":
    case "removeFootnotes":
    case "removeFilters":
    case "removeMoreOptionsButton":
      return param;
    default:
      const _exhaustiveCheck: never = param;
      return _exhaustiveCheck;
  }
};

const EMBED_QUERY_PARAMS = [
  "removeBorder",
  "optimizeSpace",
  "removeMoreOptionsButton",
  "removeLabelsInteractivity",
  "removeFootnotes",
  "removeFilters",
] as const;
type EmbedQueryParam = (typeof EMBED_QUERY_PARAMS)[number];
export type EmbedQueryParams = Record<EmbedQueryParam, boolean>;

export const isEmbedQueryParam = (param: string): param is EmbedQueryParam => {
  return [...LEGACY_EMBED_QUERY_PARAMS, ...EMBED_QUERY_PARAMS].includes(
    param as $IntentionalAny
  );
};

export const getEmbedParamsFromQuery = (
  query: Record<string, string | string[] | undefined>
): EmbedQueryParams => {
  return [
    ...LEGACY_EMBED_QUERY_PARAMS,
    ...EMBED_QUERY_PARAMS,
  ].reduce<EmbedQueryParams>(
    (acc, param) => {
      const value = query[param];

      if (value === "true") {
        acc[migrateEmbedQueryParam(param)] = true;
      }

      return acc;
    },
    {
      removeBorder: false,
      optimizeSpace: false,
      removeMoreOptionsButton: false,
      removeLabelsInteractivity: false,
      removeFootnotes: false,
      removeFilters: false,
    }
  );
};

const buildEmbedQueryParams = (embedParams: EmbedQueryParams) => {
  return Object.fromEntries(
    Object.entries(embedParams)
      .filter(([_, v]) => v)
      .map(([k]) => [k, "true"])
  );
};

export const getEmbedParamsQueryString = (embedParams: EmbedQueryParams) => {
  const queryObject = buildEmbedQueryParams(embedParams);
  const searchParams = new URLSearchParams(queryObject);

  return searchParams.toString();
};

export const useEmbedQueryParams = () => {
  const router = useRouter();
  const embedParams = useMemo(() => {
    return getEmbedParamsFromQuery(router.query);
  }, [router.query]);
  const setEmbedQueryParam = useCallback(
    (param: EmbedQueryParam, value: boolean) => {
      const updatedParams = { ...embedParams, [param]: value };
      const nonEmbedParams = Object.fromEntries(
        Object.entries(router.query).filter(([key]) => !isEmbedQueryParam(key))
      );
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...nonEmbedParams,
            ...buildEmbedQueryParams(updatedParams),
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [embedParams, router]
  );

  return {
    embedParams,
    setEmbedQueryParam,
  };
};
