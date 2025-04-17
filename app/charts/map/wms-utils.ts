import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { XMLParser } from "fast-xml-parser";

import { WMSCustomLayer } from "@/config-types";

type WMSData = {
  WMS_Capabilities: {
    Capability: {
      Layer: {
        Layer: WMSLayer[];
      };
    };
    Service: {
      OnlineResource: {
        "xlink:href": string;
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
  Layer?: WMSLayer[];
};

export type ParsedWMSLayer = {
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
  children?: ParsedWMSLayer[];
  dataUrl: string;
};

const parseWMSLayer = (
  layer: WMSLayer,
  attributes: {
    endpoint: string;
    dataUrl: string;
  },
  parentPath = ""
): ParsedWMSLayer => {
  const currentPath = `${parentPath}/${layer.Name}`;
  const res: ParsedWMSLayer = {
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
  return wmsData.WMS_Capabilities.Capability.Layer.Layer.map((l) =>
    parseWMSLayer(l, {
      endpoint,
      dataUrl,
    })
  );
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
