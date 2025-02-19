import { t, Trans } from "@lingui/macro";
import { Typography, useEventCallback } from "@mui/material";
import { XMLParser } from "fast-xml-parser";
import { useMemo } from "react";

import { Select, SelectOption } from "@/components/form";
import { BaseLayer, MapConfig } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
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

const WMTS_URL =
  "https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml";

export const CustomLayersSelector = () => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state) as MapConfig;
  const chartConfigLayers = chartConfig.baseLayer.customWMTSLayers;
  const { data, error } = useFetchData<WMTSData>({
    queryKey: ["custom-layers", locale],
    queryFn: async () => {
      return fetch(`${WMTS_URL}?lang=${locale}`).then(async (res) => {
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
  const dataLayers = data?.Capabilities.Contents.Layer;
  const handleChange = useEventCallback(
    (value: BaseLayer["customWMTSLayers"]) => {
      if (!data) {
        return;
      }

      dispatch({
        type: "CUSTOM_WMTS_LAYERS_CHANGED",
        value,
      });
    }
  );
  const options: SelectOption[] = useMemo(() => {
    if (!dataLayers) {
      return [];
    }

    return [
      {
        label: t({
          id: "controls.none",
          message: "None",
        }),
        value: FIELD_VALUE_NONE,
        isNoneValue: true,
      },
    ].concat(
      dataLayers
        .map((layer) => ({
          value: layer.ResourceURL.template,
          label: layer["ows:Title"],
          isNoneValue: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
  }, [dataLayers]);

  return error ? (
    <Typography>{error.message}</Typography>
  ) : !data ? (
    <ControlSectionSkeleton />
  ) : (
    <ControlSection collapse>
      <SectionTitle>
        <Trans id="chart.map.layers.custom-layers">Custom Layers</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        {chartConfigLayers.map((layer) => {
          const layerOptions = options.filter(
            (option) => option.value === layer.url || option.isNoneValue
          );

          return (
            <Select
              key={layer.url}
              id={`layer-${layer.url}`}
              options={layerOptions}
              sortOptions
              onChange={(e) => {
                const url = e.target.value as string;

                if (url === FIELD_VALUE_NONE) {
                  handleChange(
                    chartConfigLayers.filter((l) => l.url !== layer.url)
                  );
                }
              }}
              value={layer.url}
            />
          );
        })}
        <Select
          id="layer-add"
          label="Add layer"
          value={FIELD_VALUE_NONE}
          options={options}
          sortOptions
          onChange={(e) => {
            const url = e.target.value as string;

            if (url !== FIELD_VALUE_NONE) {
              handleChange([...chartConfigLayers, { url }]);
            }
          }}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
