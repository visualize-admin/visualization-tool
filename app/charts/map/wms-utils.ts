import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { XMLParser } from "fast-xml-parser";

import { WMSCustomLayer } from "@/config-types";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

type WMSData = {
  WMS_Capabilities: {
    Capability: {
      Layer: {
        Layer: WMSLayer[];
      };
    };
  };
};

type WMSLayer = {
  Abstract?: string;
  Name: string;
  Title: string;
  Style?: {
    LegendURL: {
      OnlineResource: {
        "xlink:href": string;
        width: number;
        height: number;
      };
    };
    "ows:Identifier": string;
    "ows:Title": string;
  };
};

export type ParsedWMSLayer = {
  id: string;
  title: string;
  description?: string;
  legendUrl?: string;
  availableDimensionValues?: (string | number)[];
  defaultDimensionValue?: string | number;
  endpoint: string;
};

const parseWMSLayer = (layer: WMSLayer, endpoint: string): ParsedWMSLayer => {
  return {
    id: layer.Name,
    title: layer.Title,
    description: layer.Abstract ?? "",
    legendUrl: layer.Style?.LegendURL.OnlineResource["xlink:href"],
    endpoint,
  };
};

export const DEFAULT_WMS_URL =
  "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0";

const fetchWMSLayersFromEndpoint = async (
  endpoint: string,
  locale: Locale
): Promise<ParsedWMSLayer[]> => {
  const url = new URL(endpoint);
  const params = url.searchParams;
  params.append("lang", locale);

  try {
    const resp = await fetch(url);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: true,
    });

    const text = await resp.text();
    return (
      parser.parse(text) as WMSData
    ).WMS_Capabilities.Capability.Layer.Layer.map((l) =>
      parseWMSLayer(l, endpoint)
    );
  } catch (e) {
    console.error(`Error fetching WMS layers from endpoint ${endpoint} :`, e);
    return [];
  }
};

export const useWMSLayers = (
  endpoints: string[],
  { pause }: { pause?: boolean } = { pause: false }
) => {
  const locale = useLocale();

  return useFetchData<ParsedWMSLayer[]>({
    queryKey: ["custom-wms-layers", locale],
    queryFn: async () => {
      return (
        await Promise.all(
          endpoints.map((endpoint) =>
            fetchWMSLayersFromEndpoint(endpoint, locale)
          )
        )
      ).flat();
    },
    options: {
      pause,
    },
  });
};

export const getWMSTile = ({
  wmsLayers,
  customLayer,
  beforeId,
}: {
  wmsLayers?: ParsedWMSLayer[];
  customLayer?: WMSCustomLayer;
  beforeId?: string;
}) => {
  if (!customLayer) {
    return;
  }

  const wmsLayer = wmsLayers?.find((layer) => layer.id === customLayer.id);

  if (!wmsLayer) {
    return;
  }

  return new DeckGLWMSLayer({
    id: `wms-layer-${customLayer.id}`,
    beforeId,
    data: "https://wms.geo.admin.ch/?",
    serviceType: "wms",
    layers: [wmsLayer.id],
  });
};
