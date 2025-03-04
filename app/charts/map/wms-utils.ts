import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { XMLParser } from "fast-xml-parser";

import { WMSCustomLayer } from "@/config-types";
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
};

const parseWMSLayer = (layer: WMSLayer): ParsedWMSLayer => {
  return {
    id: layer.Name,
    title: layer.Title,
    description: layer.Abstract ?? "",
    legendUrl: layer.Style?.LegendURL.OnlineResource["xlink:href"],
  };
};

const WMS_URL =
  "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0&lang=en";

export const useWMSLayers = (
  { pause }: { pause?: boolean } = { pause: false }
) => {
  const locale = useLocale();

  return useFetchData<ParsedWMSLayer[]>({
    queryKey: ["custom-wms-layers", locale],
    queryFn: async () => {
      return fetch(`${WMS_URL}?lang=${locale}`).then(async (res) => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          parseAttributeValue: true,
        });

        return res.text().then((text) => {
          return (
            parser.parse(text) as WMSData
          ).WMS_Capabilities.Capability.Layer.Layer.map(parseWMSLayer);
        });
      });
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
