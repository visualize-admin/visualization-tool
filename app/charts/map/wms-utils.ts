import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { XMLParser } from "fast-xml-parser";
import uniq from "lodash/uniq";

import { isRemoteLayerCRSSupported } from "@/charts/map/wms-wmts-endpoint-utils";
import { maybeArray, parseCrs } from "@/charts/map/wms-wmts-parse-utils";
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
      Request: {
        GetMap: {
          DCPType: {
            HTTP: {
              Get: {
                OnlineResource: {
                  "xlink:href": string;
                };
              };
            };
          };
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
  CRS: string[] | string;
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
  crs: string[];
  attribution: string;
};

const parseWMSLayer = (
  layer: WMSLayer,
  parentAttributes: {
    endpoint: string;
    dataUrl: string;
    attribution: string;
    crs: string[];
  },
  parentPath = ""
): RemoteWMSLayer => {
  const currentPath = `${parentPath ?? parentAttributes.endpoint}/${layer.Name ?? layer.Title}`;
  const layerCrs = (maybeArray(layer.CRS) ?? []).map((c) => parseCrs(c));

  /**
   *  CRS is inherited with behavior "add", see Table 7 — Inheritance of Layer properties from the spec
   * @see https://www.ogc.org/standards/wms/ "OpenGIS Web Map Service (WMS) Implementation Specification"
   */
  const crs = uniq([...parentAttributes.crs, ...layerCrs]);

  const res: RemoteWMSLayer = {
    // Non unique across layers
    id: layer.Name,
    // Unique across layers
    path: `${currentPath}`,
    title: layer.Title,
    description: layer.Abstract ?? "",
    legendUrl: layer.Style?.LegendURL.OnlineResource["xlink:href"],
    type: "wms",
    ...parentAttributes,
    crs,
  };

  if (layer.Layer) {
    const children = maybeArray(layer.Layer)?.map((l) =>
      parseWMSLayer(l, parentAttributes, currentPath)
    );
    res.children = children;
  }

  // Hoist single children with same id as parent, this is for UI purposes
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
  const dataUrl =
    wmsData.WMS_Capabilities.Capability.Request.GetMap.DCPType.HTTP.Get
      .OnlineResource["xlink:href"];
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
      crs: [],
    })
  );
};

export const getWMSTile = ({
  wmsLayer,
  customLayer,
  beforeId,
}: {
  wmsLayer?: RemoteWMSLayer;
  customLayer?: WMSCustomLayer | RemoteWMSLayer;
  beforeId?: string;
}) => {
  if (!customLayer) {
    return;
  }

  if (!wmsLayer) {
    return;
  }

  if (!isRemoteLayerCRSSupported(wmsLayer)) {
    console.warn(
      `WMS layer ${wmsLayer.id} is not supported in this map projection`
    );
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
