import { memo, useMemo } from "react";

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
import { MapConfig, useChartConfigFilters } from "@/config-types";
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
  const { dataSource, chartConfig } = props;
  const locale = useLocale();

  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";
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
          // FIXME: This assumes that there is only one cube.
          iri: chartConfig.cubes[0].iri,
          componentIris: [symbolDimensionIri],
          loadValues: true,
        },
      ],
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !symbolDimensionIri || symbolDimensionIri === "",
  });

  const geoCoordinatesDimensionValues =
    geoCoordinatesDimension?.dataCubesComponents.dimensions[0].values;
  const coordinates = useMemo(() => {
    return geoCoordinatesDimensionValues
      ? dimensionValuesToGeoCoordinates(geoCoordinatesDimensionValues)
      : undefined;
  }, [geoCoordinatesDimensionValues]);
  const geoShapesIri = useMemo(() => {
    const iri = areaDimensionIri || symbolDimensionIri;
    return isJoinById(iri)
      ? getResolvedJoinByIri(chartConfig.cubes[0], iri)
      : iri;
  }, [areaDimensionIri, chartConfig.cubes, symbolDimensionIri]);

  const [
    {
      data: fetchedGeoShapes,
      error: geoShapesError,
      fetching: fetchingGeoShapes,
    },
  ] = useDataCubeDimensionGeoShapesQuery({
    variables: {
      // FIXME: This assumes that there is only one cube.
      cubeIri: chartConfig.cubes[0].iri,
      dimensionIri: geoShapesIri!,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !geoShapesIri || geoShapesIri === "",
  });

  const shapes = fetchedGeoShapes?.dataCubeDimensionGeoShapes ?? undefined;
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
      <ChartContainer type="map">
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
