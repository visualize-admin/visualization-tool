import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { XMLParser } from "fast-xml-parser";

import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
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
          LegendURL: {
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

export const CustomLayersSelector = () => {
  const locale = useLocale();
  const { data, error } = useFetchData<WMTSData>({
    queryKey: ["custom-layers", locale],
    queryFn: async () => {
      return fetch(
        `https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml?lang=${locale}`
      ).then(async (res) => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          parseAttributeValue: true,
        });

        return res.text().then((text) => {
          return parser.parse(text);
        });
      });
    },
  });
  const loading = !data && !error;

  return error ? (
    <Typography>{error.message}</Typography>
  ) : loading ? (
    <ControlSectionSkeleton />
  ) : (
    <ControlSection collapse>
      <SectionTitle>
        <Trans id="chart.map.layers.custom-layers">Custom layers</Trans>
      </SectionTitle>
      <ControlSectionContent gap="none">123</ControlSectionContent>
    </ControlSection>
  );
};
