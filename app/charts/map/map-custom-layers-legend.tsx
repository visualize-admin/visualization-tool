import { Box, Typography, useTheme } from "@mui/material";
import uniq from "lodash/uniq";
import NextImage from "next/image";

import { DEFAULT_WMS_URL, RemoteWMSLayer } from "@/charts/map/wms-utils";
import {
  getLayerKey,
  useWMTSorWMSLayers,
} from "@/charts/map/wms-wmts-endpoint-utils";
import {
  DEFAULT_WMTS_URL,
  getWMTSLayerValue,
  RemoteWMTSLayer,
} from "@/charts/map/wmts-utils";
import { Error, InlineLoading } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { BaseLayer, MapConfig } from "@/config-types";
import { truthy } from "@/domain/types";
import { useLocale } from "@/locales/use-locale";
import { useFetchData } from "@/utils/use-fetch-data";

/** Constrain size, keeping aspect ratio */
const constrainSize = ({
  width,
  height,
  maxWidth,
  maxHeight,
}: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}) => {
  const aspectRatio = width / height;
  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(maxWidth / aspectRatio);
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(maxHeight * aspectRatio);
  }
  return { width, height };
};

export const MapCustomLayersLegend = ({
  chartConfig,
  value,
}: {
  chartConfig: MapConfig;
  value?: string | number;
}) => {
  const customLayers = chartConfig.baseLayer.customLayers;
  const { data: legendsData, error } = useLegendsData({ customLayers });
  const theme = useTheme();
  return error ? (
    <Error>{error.message}</Error>
  ) : !legendsData ? (
    <InlineLoading />
  ) : (
    <>
      {legendsData.map(
        ({ remoteLayer: layer, configLayer, dataUrl, width, height }) => {
          if (!configLayer) {
            return null;
          }

          const layerValue =
            configLayer.type === "wmts" && layer
              ? getWMTSLayerValue({
                  availableDimensionValues:
                    layer.availableDimensionValues ?? [],
                  defaultDimensionValue: layer.defaultDimensionValue ?? "",
                  customLayer: configLayer,
                  value,
                })
              : undefined;

          const { width: swidth, height: sheight } = constrainSize({
            width,
            height,
            maxWidth: 400,
            maxHeight: 400,
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
                  {layer.title} {layerValue ? `(${layerValue})` : ""}
                </Typography>
                {layer.description ? (
                  <InfoIconTooltip
                    title={
                      <Box
                        sx={{
                          "& > *": {
                            // We do not let the tooltip HTML override the font size
                            fontSize: `${theme.typography.caption.fontSize} !important`,
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: layer.description }}
                      />
                    }
                    sx={{ width: "fit-content" }}
                  />
                ) : null}
              </Box>
              <NextImage
                src={dataUrl}
                alt={layer.title}
                width={swidth}
                height={sheight}
              />
            </Box>
          );
        }
      )}
    </>
  );
};

const cachedLegendImages: Record<
  string,
  Promise<{ dataUrl: string; width: number; height: number } | undefined>
> = {};

const fetchLegendImage = async (
  remoteLayer: RemoteWMSLayer | RemoteWMTSLayer
) => {
  if (!remoteLayer?.legendUrl) {
    return undefined;
  }

  const blob = await fetch(remoteLayer.legendUrl).then((res) => res.blob());
  const bmp = await createImageBitmap(blob);
  const { width, height } = bmp;
  bmp.close();

  return {
    dataUrl: URL.createObjectURL(blob),
    width,
    height,
  };
};

const fetchLegendImageFromCache = async (
  remoteLayer: RemoteWMSLayer | RemoteWMTSLayer
) => {
  if (!remoteLayer?.legendUrl) {
    return undefined;
  }
  const cached = cachedLegendImages[remoteLayer.legendUrl];
  if (cached) {
    return cached;
  }
  const legendImage = fetchLegendImage(remoteLayer);
  cachedLegendImages[remoteLayer.legendUrl] = legendImage;
  return legendImage;
};

const useLegendsData = ({
  customLayers: configLayers,
}: {
  customLayers: BaseLayer["customLayers"];
}) => {
  const locale = useLocale();
  const wmsLayerConfigs = configLayers.filter((layer) => layer.type === "wms");
  const wmtsLayerConfigs = configLayers.filter(
    (layer) => layer.type === "wmts"
  );

  const wmtsEndpoints = uniq(
    wmtsLayerConfigs.map((x) => x.endpoint ?? DEFAULT_WMTS_URL)
  );
  const wmsEndpoints = uniq(
    wmsLayerConfigs.map((x) => x.endpoint ?? DEFAULT_WMS_URL)
  );
  const { data: groupedLayers, error: customLayersError } = useWMTSorWMSLayers([
    ...wmtsEndpoints,
    ...wmsEndpoints,
  ]);
  const {
    wms: wmsLayers,
    wmts: wmtsLayers,
    byKey: layersByKey,
  } = groupedLayers ?? {
    wms: [],
    wmts: [],
    byKey: {},
  };
  const { data: legendsData, error: legendsError } = useFetchData({
    queryKey: [
      "custom-layers-legends",
      configLayers.map((d) => d.id),
      wmsLayers?.map((d) => d.id),
      wmtsLayers?.map((d) => d.id),
      locale,
      1,
    ],
    queryFn: async () => {
      return (
        await Promise.all(
          configLayers.map(async (configLayer) => {
            let remoteLayer: RemoteWMSLayer | RemoteWMTSLayer | undefined =
              layersByKey[getLayerKey(configLayer)];
            const legendImage = await fetchLegendImageFromCache(remoteLayer);
            if (!legendImage) {
              return undefined;
            }
            const { width, height, dataUrl } = legendImage;
            return {
              remoteLayer,
              configLayer,
              dataUrl,
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
    error: customLayersError ?? legendsError,
  };
};
