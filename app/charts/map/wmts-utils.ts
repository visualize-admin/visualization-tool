import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { XMLParser } from "fast-xml-parser";

import { WMTSCustomLayer } from "@/config-types";

type WMTSData = {
  Capabilities: {
    Contents: {
      Layer: WMTSLayer[];
      TileMatrixSet?: {
        "ows:Identifier": string;
        "ows:SupportedCRS": string[] | string;
        TileMatrix: {
          "ows:Identifier": string;
          ScaleDenominator: number;
          TopLeftCorner: string;
          TileWidth: number;
          TileHeight: number;
          MatrixWidth: number;
          MatrixHeight: number;
        }[];
      };
    };
    "ows:ServiceProvider": {
      "ows:ProviderName": string;
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

export type RemoteWMTSLayer = {
  id: string;
  // Path is there to mirror WMS layer, but
  // not sure this is necessary since I haven't seen nested layers
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
  children?: RemoteWMTSLayer[];
  attribution: string;
  tileMatrixSet?: TileMatrixSet | undefined;
};

type TileMatrix = {
  id: string;
  scaleDenominator: number;
  topLeftCorner: [number, number];
  tileWidth: number;
  tileHeight: number;
  matrixWidth: number;
  matrixHeight: number;
};

type TileMatrixSet = {
  id: string;
  supportedCRS: string[];
  tileMatrixes: TileMatrix[];
};

const parseTileMatrixSets = (
  _tileMatrixSet: WMTSData["Capabilities"]["Contents"]["TileMatrixSet"]
): TileMatrixSet[] | null => {
  if (!_tileMatrixSet) {
    return null;
  }
  const tileMatrixSet = Array.isArray(_tileMatrixSet)
    ? _tileMatrixSet
    : [_tileMatrixSet];

  const parsedTileMatrixSet = (
    item: NonNullable<WMTSData["Capabilities"]["Contents"]["TileMatrixSet"]>
  ) => {
    const [x, y] = item.TileMatrix[0].TopLeftCorner.split(" ").map(Number);
    const tileMatrixes = Array.isArray(item.TileMatrix)
      ? item.TileMatrix
      : [item.TileMatrix];
    return {
      id: item["ows:Identifier"],
      supportedCRS: Array.isArray(item["ows:SupportedCRS"])
        ? item["ows:SupportedCRS"]
        : [item["ows:SupportedCRS"]],
      tileMatrixes: tileMatrixes.map((tm) => ({
        id: tm["ows:Identifier"],
        scaleDenominator: tm.ScaleDenominator,
        topLeftCorner: [x, y] as [number, number],
        tileWidth: tm.TileWidth,
        tileHeight: tm.TileHeight,
        matrixWidth: tm.MatrixWidth,
        matrixHeight: tm.MatrixHeight,
      })),
    };
  };

  return tileMatrixSet.map(parsedTileMatrixSet);
};

const parseWMTSLayer = (
  layer: WMTSLayer,
  attributes: {
    endpoint: string;
    attribution: string;
  },
  tileMatrixById: Record<string, TileMatrixSet> = {}
): RemoteWMTSLayer => {
  const res: RemoteWMTSLayer = {
    id: layer["ows:Identifier"],
    path: layer["ows:Identifier"],
    url: layer.ResourceURL.template || attributes.endpoint,
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
    type: "wmts",
    tileMatrixSet: tileMatrixById[layer.TileMatrixSetLink.TileMatrixSet],
    ...attributes,
  };

  /** @patrick: Haven't found any WMTS with nested layer yet */
  if (layer.Layer) {
    const children = layer.Layer
      ? layer.Layer instanceof Array
        ? layer.Layer.map((l) => parseWMTSLayer(l, attributes))
        : [parseWMTSLayer(layer.Layer, attributes, tileMatrixById)]
      : undefined;
    res.children = children;
  }

  return res;
};

const mapArrayOrUnique = <T, I>(arr: T | T[], cb: (item: T) => I): I[] => {
  if (Array.isArray(arr)) {
    return arr.map(cb);
  }
  return [cb(arr)];
};

export const parseWMTSContent = (content: string, endpoint: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  });
  const parsed = parser.parse(content) as WMTSData;
  const attributes = {
    endpoint,
    attribution:
      parsed.Capabilities["ows:ServiceProvider"]?.["ows:ProviderName"],
  };
  const tileMatrixSets = parseTileMatrixSets(
    parsed.Capabilities.Contents.TileMatrixSet
  );
  const tileMatrixById = tileMatrixSets
    ? Object.fromEntries(
        tileMatrixSets.map((tileMatrix) => [tileMatrix.id, tileMatrix])
      )
    : {};
  console.log({
    tileMatrixById: Object.values(tileMatrixById).map((x) => x.supportedCRS),
  });
  const Layer = parsed.Capabilities.Contents.Layer;
  return mapArrayOrUnique(Layer, (l) =>
    parseWMTSLayer(l, attributes, tileMatrixById)
  );
};

export const DEFAULT_WMTS_URL =
  "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml";

export const getWMTSTile = ({
  remoteWmtsLayers,
  customLayer,
  beforeId,
  value,
}: {
  remoteWmtsLayers?: RemoteWMTSLayer[];
  customLayer?: WMTSCustomLayer | RemoteWMTSLayer;
  beforeId?: string;
  value?: number | string;
}) => {
  const url = customLayer?.url ?? customLayer?.endpoint;
  if (!url) {
    console.warn("No url");
    return;
  }
  if (!customLayer) {
    console.warn("No custom layer found");
    return;
  }

  const wmtsLayer = remoteWmtsLayers?.find(
    (layer) => layer.id === customLayer.id
  );

  if (!wmtsLayer) {
    console.warn("No wmts layer");
    return;
  }

  console.log("wmtsLayer", wmtsLayer);
  return new TileLayer({
    id: `tile-layer-${url}`,
    beforeId,
    data: getWMTSLayerData(url, {
      tileMatrixSetId: wmtsLayer.tileMatrixSet?.id,
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

const getWMTSLayerData = (
  url: string,
  {
    identifier,
    value,
    tileMatrixSetId,
  }: {
    identifier: string | undefined;
    value: string | number;
    tileMatrixSetId?: TileMatrixSet["id"];
  }
) => {
  const identifierReplaced = identifier
    ? url.replace(`{${identifier}}`, `${value}`)
    : url;
  const tileMatrixSetReplaced = tileMatrixSetId
    ? identifierReplaced.replace(`{TileMatrixSet}`, tileMatrixSetId)
    : identifierReplaced;
  return tileMatrixSetReplaced
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
  customLayer?: WMTSCustomLayer | RemoteWMTSLayer;
  value?: string | number;
}) => {
  if (
    !customLayer ||
    (customLayer &&
      "syncTemporalFilters" in customLayer &&
      !customLayer.syncTemporalFilters)
  ) {
    return defaultDimensionValue;
  }

  return value && availableDimensionValues.includes(value)
    ? value
    : defaultDimensionValue;
};
