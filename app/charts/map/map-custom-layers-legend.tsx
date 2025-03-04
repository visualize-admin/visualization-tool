import { Box, Typography } from "@mui/material";
import NextImage from "next/image";

import { ParsedWMSLayer, useWMSLayers } from "@/charts/map/wms-utils";
import {
  getWMTSLayerValue,
  ParsedWMTSLayer,
  useWMTSLayers,
} from "@/charts/map/wmts-utils";
import { Error, Loading } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { BaseLayer, MapConfig } from "@/config-types";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

export const MapCustomLayersLegend = ({
  chartConfig,
  value,
}: {
  chartConfig: MapConfig;
  value?: string | number;
}) => {
  const customLayers = chartConfig.baseLayer.customLayers;
  const { data: legendsData, error } = useLegendsData({ customLayers });

  return error ? (
    <Error>{error.message}</Error>
  ) : !legendsData ? (
    <Loading />
  ) : (
    <>
      {legendsData.map(({ layer, dataUrl, width, height }) => {
        const customLayer = customLayers.find((l) => l.id === layer.id);

        if (!customLayer) {
          return null;
        }

        const layerValue =
          customLayer.type === "wmts" && layer
            ? getWMTSLayerValue({
                availableDimensionValues: layer.availableDimensionValues ?? [],
                defaultDimensionValue: layer.defaultDimensionValue ?? "",
                customLayer,
                value,
              })
            : undefined;

        return (
          <Box
            key={dataUrl}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography component="p" variant="caption">
                {layer.title} {layerValue ? `(${layerValue})` : ""}
              </Typography>
              {layer.description ? (
                <InfoIconTooltip
                  title={layer.description}
                  sx={{ width: "fit-content" }}
                />
              ) : null}
            </Box>
            <NextImage
              src={dataUrl}
              alt={layer.title}
              width={width}
              height={height}
            />
          </Box>
        );
      })}
    </>
  );
};

const useLegendsData = ({
  customLayers,
}: {
  customLayers: BaseLayer["customLayers"];
}) => {
  const locale = useLocale();
  const { data: wmsLayers, error: wmsError } = useWMSLayers();
  const { data: wmtsLayers, error: wmtsError } = useWMTSLayers();
  const { data: legendsData, error: legendsError } = useFetchData({
    queryKey: [
      "custom-layers-legends",
      customLayers.map((d) => d.id),
      wmsLayers?.map((d) => d.id),
      wmtsLayers?.map((d) => d.id),
      locale,
    ],
    queryFn: async () => {
      return (
        await Promise.all(
          customLayers.map(async (customLayer) => {
            let layer: ParsedWMSLayer | ParsedWMTSLayer | undefined;

            switch (customLayer.type) {
              case "wms":
                layer = wmsLayers?.find((l) => l.id === customLayer.id);
                break;
              case "wmts":
                layer = wmtsLayers?.find((l) => l.id === customLayer.id);
                break;
              default:
                const _exhaustiveCheck: never = customLayer;
                return _exhaustiveCheck;
            }

            if (!layer?.legendUrl) {
              return undefined;
            }

            const blob = await fetch(layer.legendUrl).then((res) => res.blob());
            const bmp = await createImageBitmap(blob);
            const { width, height } = bmp;
            bmp.close();

            return {
              layer,
              dataUrl: URL.createObjectURL(blob),
              width,
              height,
            };
          })
        )
      ).filter(truthy);
    },
    options: {
      pause: !wmsLayers || !wmtsLayers,
    },
  });

  return {
    data: legendsData,
    error: wmsError ?? wmtsError ?? legendsError,
  };
};
