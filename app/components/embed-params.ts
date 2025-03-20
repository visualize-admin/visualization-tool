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

export const useEmbedQueryParams = () => {
  const router = useRouter();
  const embedParams = useMemo(() => {
    return [
      ...LEGACY_EMBED_QUERY_PARAMS,
      ...EMBED_QUERY_PARAMS,
    ].reduce<EmbedQueryParams>(
      (acc, param) => {
        if (router.query[param] === "true") {
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
            ...Object.fromEntries(
              Object.entries(updatedParams)
                .filter(([_, v]) => v)
                .map(([k]) => [k, "true"])
            ),
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
