import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";

import { parseWMSContent, RemoteWMSLayer } from "@/charts/map/wms-utils";
import { parseWMTSContent, RemoteWMTSLayer } from "@/charts/map/wmts-utils";
import { WMSCustomLayer, WMTSCustomLayer } from "@/config-types";
import { Locale } from "@/locales/locales";
import { visitHierarchy } from "@/rdf/tree-utils";
import { useLocale } from "@/src";
import { useFetchData } from "@/utils/use-fetch-data";

/** Logic taken from GeoAdmin
 *
 * @see https://github.com/geoadmin/web-mapviewer/blob/develop/packages/mapviewer/src/api/layers/layers-external.api.js#L125
 */

/**
 * Checks if the URL is a WMS url
 *
 * @param {string} url
 * @returns {boolean}
 */
function isWmsUrl(url: string) {
  return /(wms|map=|\.map)/i.test(url);
}

/**
 * Checks if the URL is a WMTS url
 *
 * @param {string} urlreturn SetWmsUrlParameters(new URL(provider), language)
 * @returns {boolean}
 */
function isWmtsUrl(url: string) {
  return /wmts/i.test(url);
}

export const guessUrlType = (url: string) => {
  if (isWmtsUrl(url)) {
    return "wmts";
  }
  if (isWmsUrl(url)) {
    return "wms";
  }
  // Default must be coherent with the default in guessExternalLayerUrl
  return "wms";
};

/**
 * Guess the provider URL type and return URL with correct parameters if needed
 *
 * @param {string} provider Base url of the provider
 * @param {string} language Current viewer language
 * @returns {URL} Url object with backend parameters (eg. SERVICE=WMS, ...)
 */
function guessExternalLayerUrl(provider: string, language: string) {
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
function setWmtsGetCapParams(url: URL, language: string) {
  // Set mandatory parameters
  url.searchParams.set("SERVICE", "WMTS");
  url.searchParams.set("REQUEST", "GetCapabilities");
  // Set optional parameter
  if (language) {
    url.searchParams.set("lang", language);
  }
  return url;
}

function setWmsGetCapParams(url: URL, language: string) {
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

const fetchWMSorWMSLayersFromEndpoint = async (
  endpoint: string,
  locale: Locale
): Promise<(RemoteWMTSLayer | RemoteWMSLayer)[]> => {
  const { url, type } = guessExternalLayerUrl(endpoint, locale);

  try {
    const resp = await fetch(url);
    const text = await resp.text();

    return type === "wmts"
      ? parseWMTSContent(text, endpoint)
      : parseWMSContent(text, endpoint);
  } catch {
    console.error(
      `Error fetching WMTS layers from endpoint ${endpoint}`,
      endpoint
    );
    return [];
  }
};

export const getLayerKey = ({
  type,
  id,
}: WMTSCustomLayer | WMSCustomLayer | RemoteWMSLayer | RemoteWMTSLayer) => {
  return `${type}-${id}`;
};

const indexByKey = ({
  wmsLayers,
  wmtsLayers,
}: {
  wmsLayers: RemoteWMSLayer[];
  wmtsLayers: RemoteWMTSLayer[];
}): Record<string, RemoteWMSLayer | RemoteWMTSLayer> => {
  const layersByKey: Record<string, RemoteWMSLayer | RemoteWMTSLayer> = {};
  visitHierarchy(wmsLayers ?? [], (layer) => {
    layersByKey[getLayerKey(layer)] = layer;
  });
  visitHierarchy(wmtsLayers ?? [], (layer) => {
    layersByKey[getLayerKey(layer)] = layer;
  });
  return layersByKey;
};

/**
 * Right now we only support EPSG:3857 (same as CRS:84) for remote layers
 * Maybe we could support other projections system but not sure if
 * DeckGL TileLayer could support it or if we should tweak projection
 * when querying or when displaying.
 * @see https://github.com/visgl/deck.gl/discussions/6885#discussioncomment-2703052
 */
export const isCRSSupported = (crs: string | undefined) => {
  return crs && crs.includes("EPSG:3857");
};

export const isRemoteLayerCRSSupported = (
  layer: RemoteWMSLayer | RemoteWMTSLayer
) => {
  return (
    layer.crs &&
    layer.crs.length > 0 &&
    layer.crs.some((crs) => isCRSSupported(crs))
  );
};

const DEFAULT_DATA = {
  wmts: [],
  wms: [],
  byKey: {},
};

export const useWMTSorWMSLayers = (
  endpoints: string[],
  { pause }: { pause?: boolean } = { pause: false }
) => {
  const locale = useLocale();

  return useFetchData<{
    wmts: RemoteWMTSLayer[];
    wms: RemoteWMSLayer[];
    byKey: Record<string, RemoteWMSLayer | RemoteWMTSLayer>;
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
      const byKey = indexByKey({
        wmsLayers: wms as RemoteWMSLayer[],
        wmtsLayers: wmts as RemoteWMTSLayer[],
      });

      // Don't know why I need to "as" since the groupBy is correctly discriminating on type ?
      return {
        wmts: wmts as RemoteWMTSLayer[],
        wms: wms as RemoteWMSLayer[],
        byKey,
      };
    },
    options: {
      pause: pause || !endpoints.length,
      defaultData: DEFAULT_DATA,
    },
  });
};

export const makeKey = (
  layer: RemoteWMSLayer | RemoteWMTSLayer | WMSCustomLayer | WMTSCustomLayer
) => {
  return `${layer.endpoint}/${layer.id}`;
};
