import { memo, useCallback, useMemo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { shouldRenderMap } from "@/charts/map/helpers";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import {
  ChartContainer,
  ChartControlsContainer,
} from "@/charts/shared/containers";
import { NoGeometriesHint } from "@/components/hint";
import { Cube, MapConfig, useChartConfigFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  GeoCoordinates,
  GeoShapes,
  dimensionValuesToGeoCoordinates,
} from "@/domain/data";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { getResolvedJoinByIri, isJoinById } from "@/graphql/join";
import { useDataCubeDimensionGeoShapesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartMapVisualization = (props: VisualizationProps<MapConfig>) => {
  const { dataSource, chartConfig, componentIris } = props;
  const { fields } = chartConfig;
  const locale = useLocale();
  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
    keepPreviousData: true,
  });

  const getLayerIris = useCallback(
    (layer: keyof typeof fields) => {
      const iri = fields[layer]?.componentIri;

      if (iri) {
        const dimensions = componentsData?.dataCubesComponents.dimensions ?? [];
        // FIXME: We should probably introduce cubeIri to fields,
        // as otherwise we can't distinguish between cubes
        const cubeIri =
          dimensions.find((d) => d.iri === iri)?.cubeIri ??
          chartConfig.cubes[0].iri;
        const cube = chartConfig.cubes.find((c) => c.iri === cubeIri) as Cube;

        if (isJoinById(iri)) {
          return {
            dimensionIri: getResolvedJoinByIri(cube, iri) ?? iri,
            cubeIri: cube.iri,
          };
        } else {
          return {
            dimensionIri: iri,
            cubeIri,
          };
        }
      }

      return {
        dimensionIri: "",
        cubeIri: chartConfig.cubes[0].iri,
      };
    },
    [chartConfig.cubes, componentsData, fields]
  );
  const { dimensionIri: areaDimensionIri, cubeIri: areaCubeIri } = useMemo(
    () => getLayerIris("areaLayer"),
    [getLayerIris]
  );
  const { dimensionIri: symbolDimensionIri, cubeIri: symbolCubeIri } = useMemo(
    () => getLayerIris("symbolLayer"),
    [getLayerIris]
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
          iri: symbolCubeIri,
          componentIris: [symbolDimensionIri],
          loadValues: true,
        },
      ],
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !symbolDimensionIri,
  });

  const geoCoordinatesDimensionValues =
    geoCoordinatesDimension?.dataCubesComponents.dimensions[0].values;
  const coordinates = useMemo(() => {
    return geoCoordinatesDimensionValues
      ? dimensionValuesToGeoCoordinates(geoCoordinatesDimensionValues)
      : undefined;
  }, [geoCoordinatesDimensionValues]);
  const geoShapesIri = areaDimensionIri || symbolDimensionIri;
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
        iri: areaCubeIri,
        dimensionIri: geoShapesIri,
      },
    },
    pause: !geoShapesIri,
  });

  const shapes = fetchedGeoShapes?.dataCubeDimensionGeoShapes;
  const geometries: any[] | undefined = (
    shapes?.topology?.objects?.shapes as any
  )?.geometries;

  const ready = shouldRenderMap({
    areaDimensionIri,
    symbolDimensionIri,
    geometries,
    coordinates,
  });
  const error = geoCoordinatesDimensionError || geoShapesError;
  const fetching = fetchingGeoCoordinatesDimension || fetchingGeoShapes;

  const displayNoDataError =
    ready &&
    (areaDimensionIri === "" ||
      (areaDimensionIri !== "" && geometries?.length === 0)) &&
    (symbolDimensionIri === "" ||
      (symbolDimensionIri !== "" &&
        geometries?.length === 0 &&
        coordinates?.length === 0)) &&
    areaDimensionIri !== symbolDimensionIri;

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
  const { chartConfig, dimensions, observations } = props;
  const { fields } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);
  return (
    <MapChart {...props}>
      <ChartContainer>
        <MapComponent />
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
        <MapLegend chartConfig={chartConfig} observations={observations} />
      </ChartControlsContainer>
    </MapChart>
  );
});
