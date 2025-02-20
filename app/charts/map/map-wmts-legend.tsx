import { Box, Typography } from "@mui/material";
import NextImage from "next/image";

import { useWMTSLayers } from "@/charts/map/wmts-utils";
import { Error, Loading } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { MapConfig } from "@/config-types";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

export const MapWMTSLegend = ({ chartConfig }: { chartConfig: MapConfig }) => {
  const { data: legendsData, error } = useWMTSLegends({
    customWMTSLayers: chartConfig.baseLayer.customWMTSLayers,
  });

  return error ? (
    <Error>{error.message}</Error>
  ) : !legendsData ? (
    <Loading />
  ) : (
    <>
      {legendsData.map(({ src, title, description, width, height }) => {
        return (
          <Box
            key={src}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography component="p" variant="caption">
                {title}
              </Typography>
              <InfoIconTooltip
                title={description}
                sx={{ width: "fit-content" }}
              />
            </Box>
            <NextImage src={src} alt={title} width={width} height={height} />
          </Box>
        );
      })}
    </>
  );
};

const useWMTSLegends = ({
  customWMTSLayers,
}: {
  customWMTSLayers: MapConfig["baseLayer"]["customWMTSLayers"];
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
              src: URL.createObjectURL(blob),
              title: wmtsLayer.Style["ows:Title"],
              description: wmtsLayer["ows:Abstract"],
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
