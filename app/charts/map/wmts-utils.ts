import { XMLParser } from "fast-xml-parser";

import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

type WMTSData = {
  Capabilities: {
    Contents: {
      Layer: {
        Dimension: {
          Default: string;
          Value: string;
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
      enable: !pause,
    },
  });
};

export const isValidWMTSLayerUrl = (url: string) => {
  return url.includes("wmts.geo.admin.ch");
};

export const getWMTSLayerData = (url: string) => {
  return url
    .replace("{Time}", "current")
    .replace("{TileMatrix}", "{z}")
    .replace("{TileCol}", "{x}")
    .replace("{TileRow}", "{y}");
};
