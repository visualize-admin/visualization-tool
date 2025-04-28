import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { XMLParser } from "fast-xml-parser";

import { WMSCustomLayer } from "@/config-types";

type WMSData = {
  WMS_Capabilities: {
    Capability: {
      Layer: {
        Layer: WMSLayer[];
        Attribution: {
          Title: string;
        };
      };
    };
    Service: {
      OnlineResource: {
        "xlink:href": string;
      };
      Title: string;
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
  Layer?: WMSLayer[];
};

export type RemoteWMSLayer = {
  /** id not unique */
  id: string;
  /** path should be unique */
  path: string;
  title: string;
  description?: string;
  legendUrl?: string;
  availableDimensionValues?: (string | number)[];
  defaultDimensionValue?: string | number;
  endpoint: string;
  type: "wms";
  children?: RemoteWMSLayer[];
  dataUrl: string;
  attribution: string;
};

const parseWMSLayer = (
  layer: WMSLayer,
  attributes: {
    endpoint: string;
    dataUrl: string;
    attribution: string;
  },
  parentPath = ""
): RemoteWMSLayer => {
  const currentPath = `${parentPath ?? ""}/${layer.Name ?? layer.Title}`;
  const res: RemoteWMSLayer = {
    // Non unique
    id: layer.Name,
    // Unique
    path: `${currentPath}`,
    title: layer.Title,
    description: layer.Abstract ?? "",
    legendUrl: layer.Style?.LegendURL.OnlineResource["xlink:href"],
    type: "wms",
    ...attributes,
  };
  if (layer.Layer) {
    const children = layer.Layer
      ? layer.Layer instanceof Array
        ? layer.Layer.map((l) => parseWMSLayer(l, attributes, currentPath))
        : [parseWMSLayer(layer.Layer, attributes, currentPath)]
      : undefined;
    res.children = children;
  }

  // Hoist single children with same id as parent
  if (res.children?.length === 1 && res.children[0]!.id === res.id) {
    return res.children[0];
  }
  return res;
};

export const DEFAULT_WMS_URL =
  "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0";

export const parseWMSContent = (content: string, endpoint: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  });

  const wmsData = parser.parse(content) as WMSData;
  const dataUrl = wmsData.WMS_Capabilities.Service.OnlineResource["xlink:href"];
  const attribution =
    wmsData.WMS_Capabilities.Capability.Layer.Attribution?.Title ??
    wmsData.WMS_Capabilities.Service.Title;

  const layers = Array.isArray(wmsData.WMS_Capabilities.Capability.Layer.Layer)
    ? wmsData.WMS_Capabilities.Capability.Layer.Layer
    : [wmsData.WMS_Capabilities.Capability.Layer.Layer];
  return layers.map((l) =>
    parseWMSLayer(l, {
      endpoint,
      dataUrl,
      attribution,
    })
  );
};

export const getWMSTile = ({
  wmsLayers,
  customLayer,
  beforeId,
}: {
  wmsLayers?: RemoteWMSLayer[];
  customLayer?: WMSCustomLayer | RemoteWMSLayer;
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
    data: `${wmsLayer.dataUrl.replace(/\?$/, "")}`,
    loadOptions: {
      fetch: (url: string) => {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set("TRANSPARENT", "TRUE");
        return fetch(parsedUrl.toString());
      },
    },
    serviceType: "wms",
    layers: [wmsLayer.id],
  });
};
