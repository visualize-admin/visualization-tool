import { Box, Typography } from "@mui/material";
import NextImage from "next/image";

import { getWMTSLayerValue, useWMTSLayers } from "@/charts/map/wmts-utils";
import { Error, Loading } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { BaseLayer, MapConfig } from "@/config-types";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

export const MapWMTSLegend = ({
  chartConfig,
  value,
}: {
  chartConfig: MapConfig;
  value?: string | number;
}) => {
  const customLayers = chartConfig.baseLayer.customLayers;
  const { data: legendsData, error } = useWMTSLegends({
    customWMTSLayers: chartConfig.baseLayer.customLayers,
  });

  return error ? (
    <Error>{error.message}</Error>
  ) : !legendsData ? (
    <Loading />
  ) : (
    <>
      {legendsData.map(({ wmtsLayer, dataUrl, width, height }) => {
        const customLayer = customLayers.find(
          (l) => l.url === wmtsLayer.ResourceURL.template
        );
        const layerValue = getWMTSLayerValue({
          wmtsLayer,
          customLayer,
          value,
        });

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
                {wmtsLayer["ows:Title"]} ({layerValue})
              </Typography>
              <InfoIconTooltip
                title={wmtsLayer["ows:Abstract"]}
                sx={{ width: "fit-content" }}
              />
            </Box>
            <NextImage
              src={dataUrl}
              alt={wmtsLayer["ows:Title"]}
              width={width}
              height={height}
            />
          </Box>
        );
      })}
    </>
  );
};

const useWMTSLegends = ({
  customWMTSLayers,
}: {
  customWMTSLayers: BaseLayer["customLayers"];
}) => {
  const locale = useLocale();
  const { data: wmtsLayers, error: wmtsError } = useWMTSLayers();
  const { data: legendsData, error: legendsError } = useFetchData({
    queryKey: [
      "wmts-legends",
      customWMTSLayers.map((l) => l.url),
      wmtsLayers?.map((d) => d.ResourceURL.template),
      locale,
    ],
    queryFn: async () => {
      return (
        await Promise.all(
          customWMTSLayers.map(async (chartLayer) => {
            const wmtsLayer = wmtsLayers?.find(
              (l) => l.ResourceURL.template === chartLayer.url
            );
            const url = wmtsLayer?.Style.LegendURL?.["xlink:href"];

            if (!url) {
              return null;
            }

            const blob = await fetch(url).then((res) => res.blob());
            const bmp = await createImageBitmap(blob);
            const { width, height } = bmp;
            bmp.close();

            return {
              wmtsLayer,
              dataUrl: URL.createObjectURL(blob),
              width,
              height,
            };
          })
        )
      ).filter(truthy);
    },
    options: {
      pause: !wmtsLayers,
    },
  });

  return {
    data: legendsData,
    error: wmtsError ?? legendsError,
  };
};
