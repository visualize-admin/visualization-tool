import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import { XMLParser } from "fast-xml-parser";

import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

type WMTSData = {
  Capabilities: {
    Contents: {
      Layer: {
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
      }[];
    };
  };
};

const WMTS_URL =
  "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml";

export const useWMTSLayers = (
  { pause }: { pause?: boolean } = { pause: false }
) => {
  const locale = useLocale();

  return useFetchData<WMTSData["Capabilities"]["Contents"]["Layer"]>({
    queryKey: ["custom-layers", locale],
    queryFn: async () => {
      return fetch(`${WMTS_URL}?lang=${locale}`).then(async (res) => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          parseAttributeValue: true,
        });

        return res.text().then((text) => {
          return parser.parse(text).Capabilities.Contents.Layer;
        });
      });
    },
    options: {
      pause,
    },
  });
};

export const getWMTSTile = ({
  wmtsLayers,
  url,
  beforeId,
  value,
}: {
  wmtsLayers?: WMTSData["Capabilities"]["Contents"]["Layer"];
  url: string;
  beforeId?: string;
  value?: number | string;
}) => {
  if (!isValidWMTSLayerUrl(url)) {
    return;
  }

  const wmtsLayer = wmtsLayers?.find(
    (layer) => layer.ResourceURL.template === url
  );

  if (!wmtsLayer) {
    return;
  }

  const values = wmtsLayer.Dimension.Value;

  return new TileLayer({
    id: `tile-layer-${url}`,
    beforeId,
    data: getWMTSLayerData(url, {
      value:
        Array.isArray(values) && value && values.includes(value)
          ? value
          : wmtsLayer.Dimension.Default,
    }),
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
  { value }: { value: string | number }
) => {
  return url
    .replace("{Time}", `${value}`)
    .replace("{TileMatrix}", "{z}")
    .replace("{TileCol}", "{x}")
    .replace("{TileRow}", "{y}");
};
