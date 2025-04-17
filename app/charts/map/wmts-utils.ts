import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { XMLParser } from "fast-xml-parser";

import { WMTSCustomLayer } from "@/config-types";

type WMTSData = {
  Capabilities: {
    Contents: {
      Layer: WMTSLayer[];
    };
  };
};

type WMTSLayer = {
  Dimension: {
    Default: string | number;
    Value: string | number | (string | number)[];
    "ows:Identifier": string;
  };
  Format: string;
  ResourceURL: {
    format: string;
    resourceType: string;
    template: string;
  };
  Style: {
    LegendURL?: {
      format: string;
      "xlink:href": string;
    };
    "ows:Identifier": string;
    "ows:Title": string;
  };
  TileMatrixSetLink: {
    TileMatrixSet: string;
  };
  "ows:Abstract": string;
  "ows:Identifier": string;
  "ows:Metadata": {
    "xlink:href": string;
  };
  "ows:Title": string;
  "ows:WGS84BoundingBox": {
    "ows:LowerCorner": string;
    "ows:UpperCorner": string;
  };
  Layer?: WMTSLayer[];
};

export type ParsedWMTSLayer = {
  id: string;
  // Path is there to mirror WMS layer, but
  // not sure this is be necessary
  path: string;
  url: string;
  title: string;
  description?: string;
  legendUrl?: string;
  dimensionIdentifier: string | undefined;
  availableDimensionValues: (string | number)[] | undefined;
  defaultDimensionValue: string | number;
  endpoint: string;
  type: "wmts";
  children?: ParsedWMTSLayer[];
};

const parseWMTSLayer = (
  layer: WMTSLayer,
  endpoint: string
): ParsedWMTSLayer => {
  const res: ParsedWMTSLayer = {
    id: layer["ows:Identifier"],
    path: layer["ows:Identifier"],
    url: layer.ResourceURL.template,
    title: layer["ows:Title"],
    description: layer["ows:Abstract"],
    legendUrl: layer.Style.LegendURL?.["xlink:href"],
    /** @patrick: Not sure why but dimension can be missing (see zh.wmts.xml) */
    dimensionIdentifier: layer.Dimension?.["ows:Identifier"],
    availableDimensionValues: layer.Dimension
      ? Array.isArray(layer.Dimension.Value)
        ? layer.Dimension.Value
        : [layer.Dimension.Value]
      : undefined,
    defaultDimensionValue: layer.Dimension?.Default,
    endpoint,
    type: "wmts",
  };

  /** @patrick: Haven't found any WMTS with nested layer yet */
  if (layer.Layer) {
    const children = layer.Layer
      ? layer.Layer instanceof Array
        ? layer.Layer.map((l) => parseWMTSLayer(l, endpoint))
        : [parseWMTSLayer(layer.Layer, endpoint)]
      : undefined;
    res.children = children;
  }

  return res;
};

export const parseWMTSContent = (content: string, endpoint: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  });
  return (parser.parse(content) as WMTSData).Capabilities.Contents.Layer.map(
    (l) => parseWMTSLayer(l, endpoint)
  );
};

export const DEFAULT_WMTS_URL =
  "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml";

export const getWMTSTile = ({
  wmtsLayers,
  customLayer,
  beforeId,
  value,
}: {
  wmtsLayers?: ParsedWMTSLayer[];
  customLayer?: WMTSCustomLayer;
  beforeId?: string;
  value?: number | string;
}) => {
  if (!customLayer || !isValidWMTSLayerUrl(customLayer.url)) {
    return;
  }

  const wmtsLayer = wmtsLayers?.find((layer) => layer.id === customLayer.id);

  if (!wmtsLayer) {
    return;
  }

  return new TileLayer({
    id: `tile-layer-${customLayer.url}`,
    beforeId,
    data: getWMTSLayerData(customLayer.url, {
      identifier: wmtsLayer.dimensionIdentifier,
      value: getWMTSLayerValue({
        availableDimensionValues: wmtsLayer.availableDimensionValues ?? [],
        defaultDimensionValue: wmtsLayer.defaultDimensionValue,
        customLayer,
        value,
      }),
    }),
    tileSize: 256,
    renderSubLayers: (props) => {
      const { boundingBox } = props.tile;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [
          boundingBox[0][0],
          boundingBox[0][1],
          boundingBox[1][0],
          boundingBox[1][1],
        ],
      });
    },
  });
};

const isValidWMTSLayerUrl = (url: string) => {
  return url.includes("wmts.geo.admin.ch");
};

const getWMTSLayerData = (
  url: string,
  { identifier, value }: { identifier: string; value: string | number }
) => {
  return url
    .replace(`{${identifier}}`, `${value}`)
    .replace("{TileMatrix}", "{z}")
    .replace("{TileCol}", "{x}")
    .replace("{TileRow}", "{y}");
};

export const getWMTSLayerValue = ({
  availableDimensionValues,
  defaultDimensionValue,
  customLayer,
  value,
}: {
  availableDimensionValues: (string | number)[];
  defaultDimensionValue: string | number;
  customLayer?: WMTSCustomLayer;
  value?: string | number;
}) => {
  if (!customLayer?.syncTemporalFilters) {
    return defaultDimensionValue;
  }

  return value && availableDimensionValues.includes(value)
    ? value
    : defaultDimensionValue;
};
