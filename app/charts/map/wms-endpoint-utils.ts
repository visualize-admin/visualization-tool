import { ParsedWMSLayer, parseWMSResponse } from "@/charts/map/wms-utils";
import { ParsedWMTSLayer, parseWMTSResponse } from "@/charts/map/wmts-utils";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/src";
import { useFetchData } from "@/utils/use-fetch-data";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";

/** Logic taken from GeoAdmin
 *
 * @see https://github.com/geoadmin/web-mapviewer/blob/develop/packages/mapviewer/src/api/layers/layers-external.api.js#L125
 */

// /**
//  * Checks if file has WMS Capabilities XML content
//  *
//  * @param {string} fileContent
//  * @returns {boolean}
//  */
// export function isWmsGetCap(fileContent: string) {
//   return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(fileContent);
// }

// /**
//  * Checks if file has WMTS Capabilities XML content
//  *
//  * @param {string} fileContent
//  * @returns {boolean}
//  */
// export function isWmtsGetCap(fileContent: string) {
//   return /<Capabilities/.test(fileContent);
// }

/**
 * Checks if the URL is a WMS url
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isWmsUrl(url: string) {
  return /(wms|map=|\.map)/i.test(url);
}

/**
 * Checks if the URL is a WMTS url
 *
 * @param {string} urlreturn SetWmsUrlParameters(new URL(provider), language)
 * @returns {boolean}
 */
export function isWmtsUrl(url: string) {
  return /wmts/i.test(url);
}

/**
 * Guess the provider URL type and return URL with correct parameters if needed
 *
 * @param {string} provider Base url of the provider
 * @param {string} language Current viewer language
 * @returns {URL} Url object with backend parameters (eg. SERVICE=WMS, ...)
 */
export function guessExternalLayerUrl(provider: string, language: string) {
  if (isWmtsUrl(provider)) {
    return {
      type: "wmts" as const,
      url: setWmtsGetCapParams(new URL(provider), language),
    };
  }
  if (isWmsUrl(provider)) {
    return {
      type: "wms" as const,
      url: setWmsGetCapParams(new URL(provider), language),
    };
  }
  // By default if the URL service type cannot be guessed we use WMS
  return {
    type: "wms",
    url: setWmsGetCapParams(new URL(provider), language),
  };
}

/**
 * Sets the WMTS GetCapabilities url parameters
 *
 * @param {URL} url Url to set
 * @param {string} language Language to use
 * @returns {URL} Url with wmts parameters
 */
export function setWmtsGetCapParams(url: URL, language: string) {
  // Set mandatory parameters
  url.searchParams.set("SERVICE", "WMTS");
  url.searchParams.set("REQUEST", "GetCapabilities");
  // Set optional parameter
  if (language) {
    url.searchParams.set("lang", language);
  }
  return url;
}

export function setWmsGetCapParams(url: URL, language: string) {
  // Mandatory params
  url.searchParams.set("SERVICE", "WMS");
  url.searchParams.set("REQUEST", "GetCapabilities");
  // Currently openlayers only supports version 1.3.0 !
  url.searchParams.set("VERSION", "1.3.0");
  // Optional params
  url.searchParams.set("FORMAT", "text/xml");
  if (language) {
    url.searchParams.set("lang", language);
  }
  return url;
}

export const fetchWMSorWMSLayersFromEndpoint = async (
  endpoint: string,
  locale: Locale
): Promise<(ParsedWMTSLayer | ParsedWMSLayer)[]> => {
  const { url, type } = guessExternalLayerUrl(endpoint, locale);

  try {
    const resp = await fetch(url);
    return type === "wmts"
      ? parseWMTSResponse(resp, endpoint)
      : parseWMSResponse(resp, endpoint);
  } catch {
    console.error(
      `Error fetching WMTS layers from endpoint ${endpoint}`,
      endpoint
    );
    return [];
  }
};

export const useWMTSorWMSLayers = (
  endpoints: string[],
  { pause }: { pause?: boolean } = { pause: false }
) => {
  const locale = useLocale();

  return useFetchData<{
    wmts: ParsedWMTSLayer[];
    wms: ParsedWMSLayer[];
  }>({
    queryKey: [`custom-layers`, ...sortBy(endpoints), locale],
    queryFn: async () => {
      const allLayers = (
        await Promise.all(
          endpoints.map((endpoint) =>
            fetchWMSorWMSLayersFromEndpoint(endpoint, locale)
          )
        )
      ).flat();
      const { wmts = [], wms = [] } = groupBy(allLayers, (x) => x.type);

      // Don't know why I need to as since the groupBy is correctly discriminating on type ?
      return { wmts: wmts as ParsedWMTSLayer[], wms: wms as ParsedWMSLayer[] };
    },
    options: {
      pause,
    },
  });
};
