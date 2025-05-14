import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { XMLParser } from "fast-xml-parser";
import uniq from "lodash/uniq";

import {
  isCRSSupported,
  isRemoteLayerCRSSupported,
} from "@/charts/map/wms-wmts-endpoint-utils";
import { maybeArray, parseCrs } from "@/charts/map/wms-wmts-parse-utils";
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
    "ows:OperationsMetadata": {
      "ows:Operation": {
        name: string;
        "ows:DCP": {
          "ows:HTTP": {
            "ows:Get": {
              "xlink:href": string;
            };
          };
        };
      }[];
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
  tileMatrixSets?: TileMatrixSet[] | undefined;
  crs: string[];
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
      supportedCRS: (maybeArray(item["ows:SupportedCRS"]) ?? []).map((crs) =>
        parseCrs(crs)
      ),
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
  tileMatrixById: Record<string, TileMatrixSet> = {},
  getTileUrl: string | undefined
): RemoteWMTSLayer => {
  const tileMatrixSetLinks = maybeArray(layer.TileMatrixSetLink) ?? [];
  const tileMatrixSets = tileMatrixSetLinks.map(
    (tl) => tileMatrixById[tl.TileMatrixSet]
  );
  const res: RemoteWMTSLayer = {
    id: layer["ows:Identifier"],
    path: layer["ows:Identifier"],
    url: layer.ResourceURL.template || getTileUrl || attributes.endpoint,
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
    tileMatrixSets: tileMatrixSets,
    crs: uniq(
      tileMatrixSets
        .map((ts) => (ts?.supportedCRS ?? []).map((crs) => parseCrs(crs)))
        .flat()
    ),
    ...attributes,
  };

  /** @patrick: Haven't found any WMTS with nested layer yet */
  if (layer.Layer) {
    const children = layer.Layer
      ? layer.Layer instanceof Array
        ? layer.Layer.map((l) => parseWMTSLayer(l, attributes, {}, getTileUrl))
        : [parseWMTSLayer(layer.Layer, attributes, tileMatrixById, getTileUrl)]
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

const formatGetTileUrl = (url: string) => {
  /**
   * We use TileMatrixNamespaced here since when replaced in getDataUrl, we need to have the tileMatrix with the
   * namespace.
   * - This is for the getTile case (layer without resourceUrl).
   * - When layer:resourceUrl is used, we do not need the namespace.
   */
  return `${url.endsWith("?") ? url : `${url}?`}Service=WMTS&Request=GetTile&Transparent=true&Version=1.0.0&Format=image/png&tileMatrixSet={TileMatrixSet}&tileMatrix={TileMatrixNamespaced}&tileRow={TileRow}&tileCol={TileCol}&layer={Layer}`;
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
  const getTileOperation = parsed.Capabilities["ows:OperationsMetadata"]?.[
    "ows:Operation"
  ]?.find((operation) => operation["name"] === "GetTile");
  const getTileUrlRaw =
    getTileOperation?.["ows:DCP"]?.["ows:HTTP"]?.["ows:Get"]?.["xlink:href"];
  const getTileUrl = getTileUrlRaw
    ? formatGetTileUrl(getTileUrlRaw)
    : undefined;

  const tileMatrixSets = parseTileMatrixSets(
    parsed.Capabilities.Contents.TileMatrixSet
  );
  const tileMatrixById = tileMatrixSets
    ? Object.fromEntries(
        tileMatrixSets.map((tileMatrix) => [tileMatrix.id, tileMatrix])
      )
    : {};
  const Layer = parsed.Capabilities.Contents.Layer;
  return mapArrayOrUnique(Layer, (l) =>
    parseWMTSLayer(l, attributes, tileMatrixById, getTileUrl)
  );
};

export const DEFAULT_WMTS_URL =
  "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml";

export const getWMTSTile = ({
  wmtsLayer,
  customLayer,
  beforeId,
  value,
}: {
  wmtsLayer?: RemoteWMTSLayer;
  customLayer?: WMTSCustomLayer | RemoteWMTSLayer;
  beforeId?: string;
  value?: number | string;
}) => {
  const url = customLayer?.url ?? customLayer?.endpoint;
  if (customLayer && customLayer.url === "undefined") {
    console.warn("No url on layer, defaulted to endpoint");
    return;
  }
  if (!customLayer) {
    console.warn("No custom layer found");
    return;
  }

  if (!wmtsLayer) {
    console.warn("No wmts layer");
    return;
  }

  if (!url) {
    console.warn("No url found");
    return;
  }

  if (!isRemoteLayerCRSSupported(wmtsLayer)) {
    console.warn(
      `The WMTS layer ${wmtsLayer.id} does not have a supported CRS, skipping layer.`
    );
    return;
  }

  const espg3857TileMatrixSet = wmtsLayer.tileMatrixSets?.find((tms) => {
    return tms.supportedCRS.some((crs) => isCRSSupported(crs));
  });

  const tileLayerDataUrl = getWMTSLayerData(url, {
    tileMatrixSetId: espg3857TileMatrixSet?.id,
    identifier: wmtsLayer.dimensionIdentifier,
    layerId: wmtsLayer.id,
    value: getWMTSLayerValue({
      availableDimensionValues: wmtsLayer.availableDimensionValues ?? [],
      defaultDimensionValue: wmtsLayer.defaultDimensionValue,
      customLayer,
      value,
    }),
  });
  return new TileLayer({
    id: `tile-layer-${url}`,
    beforeId,
    data: tileLayerDataUrl,
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
    layerId,
  }: {
    identifier: string | undefined;
    value: string | number;
    tileMatrixSetId?: TileMatrixSet["id"];
    layerId?: string;
  }
) => {
  const identifierReplaced = identifier
    ? url.replace(`{${identifier}}`, `${value}`)
    : url;
  return identifierReplaced
    .replace(`{TileMatrixSet}`, tileMatrixSetId ?? "{TileMatrixSet}")
    .replace(
      "{TileMatrixNamespaced}",
      tileMatrixSetId ? `${tileMatrixSetId}:{z}` : "{z}"
    )
    .replace(`{Layer}`, layerId ?? "{Layer}")
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
