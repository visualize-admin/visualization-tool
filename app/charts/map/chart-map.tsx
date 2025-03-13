import { Box } from "@mui/material";
import { memo, useCallback, useMemo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { shouldRenderMap } from "@/charts/map/helpers";
import { MapComponent } from "@/charts/map/map";
import { MapCustomLayersLegend } from "@/charts/map/map-custom-layers-legend";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import {
  ChartContainer,
  ChartControlsContainer,
} from "@/charts/shared/containers";
import { NoGeometriesHint } from "@/components/hint";
import { Cube, MapConfig } from "@/config-types";
import {
  useChartConfigFilters,
  useDefinitiveTemporalFilterValue,
  useLimits,
} from "@/config-utils";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  dimensionValuesToGeoCoordinates,
  GeoCoordinates,
  GeoShapes,
} from "@/domain/data";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { getResolvedJoinById, isJoinById } from "@/graphql/join";
import { useDataCubeDimensionGeoShapesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartMapVisualization = (props: VisualizationProps<MapConfig>) => {
  const { dataSource, chartConfig, componentIds } = props;
  const { fields } = chartConfig;
  const locale = useLocale();
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIds,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
    keepPreviousData: true,
  });

  const getLayerIds = useCallback(
    (layer: keyof typeof fields) => {
      const layerComponent = fields[layer];

      if (layerComponent) {
        const cubeIri =
          componentsQuery.data?.dataCubesComponents.dimensions.find(
            (d) => d.id === layerComponent.componentId
          )?.cubeIri;
        const cube = chartConfig.cubes.find((c) => c.iri === cubeIri) as Cube;

        if (isJoinById(layerComponent.componentId)) {
          return {
            dimensionId:
              getResolvedJoinById(cube, layerComponent.componentId) ??
              layerComponent.componentId,
            cubeIri: cube.iri,
          };
        } else {
          return {
            dimensionId: layerComponent.componentId,
            cubeIri,
          };
        }
      }

      return {
        dimensionId: "",
        cubeIri: chartConfig.cubes[0].iri,
      };
    },
    [chartConfig.cubes, componentsQuery.data, fields]
  );
  const { dimensionId: areaDimensionId, cubeIri: areaCubeIri } = useMemo(
    () => getLayerIds("areaLayer"),
    [getLayerIds]
  );
  const { dimensionId: symbolDimensionId, cubeIri: symbolCubeIri } = useMemo(
    () => getLayerIds("symbolLayer"),
    [getLayerIds]
  );
  const [
    {
      data: geoCoordinatesDimension,
      error: geoCoordinatesDimensionError,
      fetching: fetchingGeoCoordinatesDimension,
    },
  ] = useDataCubesComponentsQuery({
    variables: {
      cubeFilters: [
        {
          iri: symbolCubeIri!,
          componentIds: [symbolDimensionId],
          loadValues: true,
        },
      ],
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !symbolDimensionId || !symbolCubeIri,
  });

  const geoCoordinatesDimensionValues =
    geoCoordinatesDimension?.dataCubesComponents.dimensions[0].values;
  const coordinates = useMemo(() => {
    return geoCoordinatesDimensionValues
      ? dimensionValuesToGeoCoordinates(geoCoordinatesDimensionValues)
      : undefined;
  }, [geoCoordinatesDimensionValues]);
  const geoShapesId = areaDimensionId || symbolDimensionId;
  const [
    {
      data: fetchedGeoShapes,
      error: geoShapesError,
      fetching: fetchingGeoShapes,
    },
  ] = useDataCubeDimensionGeoShapesQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilter: {
        iri: areaCubeIri!,
        dimensionId: geoShapesId,
      },
    },
    pause: !geoShapesId || !areaCubeIri,
  });

  const shapes = fetchedGeoShapes?.dataCubeDimensionGeoShapes;
  const geometries: any[] | undefined = (
    shapes?.topology?.objects?.shapes as any
  )?.geometries;

  const ready = shouldRenderMap({
    areaDimensionId,
    symbolDimensionId,
    geometries,
    coordinates,
  });
  const error = geoCoordinatesDimensionError || geoShapesError;
  const fetching = fetchingGeoCoordinatesDimension || fetchingGeoShapes;

  const displayNoDataError =
    ready &&
    (areaDimensionId === "" ||
      (areaDimensionId !== "" && geometries?.length === 0)) &&
    (symbolDimensionId === "" ||
      (symbolDimensionId !== "" &&
        geometries?.length === 0 &&
        coordinates?.length === 0)) &&
    areaDimensionId !== symbolDimensionId;

  return displayNoDataError ? (
    <NoGeometriesHint />
  ) : (
    <ChartDataWrapper
      {...props}
      error={error}
      fetching={fetching}
      Component={ChartMap}
      ComponentProps={{ shapes, coordinates }}
    />
  );
};

export type ChartMapProps = ChartProps<MapConfig> & {
  shapes: GeoShapes | undefined;
  coordinates: GeoCoordinates | undefined;
};

const ChartMap = memo((props: ChartMapProps) => {
  const { chartConfig, dimensions, measures, observations } = props;
  const { fields } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);
  const temporalFilterValue = useDefinitiveTemporalFilterValue({ dimensions });
  const limits = useLimits({
    chartConfig,
    dimensions,
    measures,
  });

  return (
    <MapChart {...props}>
      <ChartContainer>
        <MapComponent
          limits={limits}
          customLayers={chartConfig.baseLayer.customLayers}
          value={temporalFilterValue ? +temporalFilterValue : undefined}
        />
        <MapTooltip />
      </ChartContainer>
      <ChartControlsContainer sx={{ mt: 6 }}>
        {fields.animation && (
          <TimeSlider
            filters={filters}
            dimensions={dimensions}
            {...fields.animation}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <MapLegend chartConfig={chartConfig} observations={observations} />
          <MapCustomLayersLegend
            chartConfig={chartConfig}
            value={temporalFilterValue ? +temporalFilterValue : undefined}
          />
        </Box>
      </ChartControlsContainer>
    </MapChart>
  );
});
