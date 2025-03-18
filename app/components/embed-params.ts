import { ParsedUrlQuery } from "querystring";

const LEGACY_EMBED_QUERY_PARAMS = ["disableBorder"] as const;

export type LegacyEmbedQueryParam = (typeof LEGACY_EMBED_QUERY_PARAMS)[number];

const migrateEmbedQueryParam = (
  param: LegacyEmbedQueryParam | EmbedQueryParam
): EmbedQueryParam => {
  switch (param) {
    case "disableBorder":
      return "removeBorder";
    case "optimizeSpace":
    case "removeAxisLabelsInteractivity":
    case "removeBorder":
    case "removeLegend":
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
  "removeAxisLabelsInteractivity",
  "removeLegend",
] as const;

export type EmbedQueryParam = (typeof EMBED_QUERY_PARAMS)[number];

export const isEmbedQueryParam = (param: string): param is EmbedQueryParam => {
  return EMBED_QUERY_PARAMS.includes(param as $IntentionalAny);
};

export const useEmbedQueryParams = (query: ParsedUrlQuery) => {
  const embedParams: Record<EmbedQueryParam, boolean> = {
    removeBorder: false,
    optimizeSpace: false,
    removeMoreOptionsButton: false,
    removeAxisLabelsInteractivity: false,
    removeLegend: false,
  };

  [...LEGACY_EMBED_QUERY_PARAMS, ...EMBED_QUERY_PARAMS].forEach((param) => {
    if (query[param] === "true") {
      embedParams[migrateEmbedQueryParam(param)] = true;
    }
  });

  return embedParams;
};
