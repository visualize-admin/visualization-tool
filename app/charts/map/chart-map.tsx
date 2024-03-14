import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import {
  ChartContainer,
  ChartControlsContainer,
} from "@/charts/shared/containers";
import { NoGeometriesHint } from "@/components/hint";
import { DataSource, MapConfig, useChartConfigFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { GeoCoordinates, GeoShapes } from "@/domain/data";
import {
  DataCubeObservationFilter,
  useDataCubeDimensionGeoCoordinatesQuery,
  useDataCubeDimensionGeoShapesQuery,
} from "@/graphql/query-hooks";

import { ChartProps } from "../shared/ChartProps";

export const ChartMapVisualization = ({
  dataSource,
  componentIris,
  chartConfig,
  queryFilters,
}: {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: MapConfig;
  queryFilters?: DataCubeObservationFilter[];
}) => {
  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";

  const [
    {
      data: fetchedGeoCoordinates,
      error: geoCoordinatesError,
      fetching: fetchingGeoocordinates,
    },
  ] = useDataCubeDimensionGeoCoordinatesQuery({
    variables: {
      // FIXME: This assumes that there is only one cube.
      cubeIri: chartConfig.cubes[0].iri,
      dimensionIri: symbolDimensionIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
    },
    pause: !symbolDimensionIri || symbolDimensionIri === "",
  });

  const coordinates =
    fetchedGeoCoordinates?.dataCubeDimensionGeoCoordinates ?? undefined;
  const geoShapesIri = areaDimensionIri || symbolDimensionIri;
  const [
    {
      data: fetchedGeoShapes,
      error: geoShapesError,
      fetching: fetchingGeoshapes,
    },
  ] = useDataCubeDimensionGeoShapesQuery({
    variables: {
      // FIXME: This assumes that there is only one cube.
      cubeIri: chartConfig.cubes[0].iri,
      dimensionIri: geoShapesIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
    },
    pause: !geoShapesIri || geoShapesIri === "",
  });

  const shapes = fetchedGeoShapes?.dataCubeDimensionGeoShapes ?? undefined;
  const geometries: any[] | undefined = (
    shapes?.topology?.objects?.shapes as any
  )?.geometries;

  const ready =
    (areaDimensionIri !== "" && geometries) ||
    (symbolDimensionIri !== "" && coordinates) ||
    geometries ||
    // Raw map without any data layer.
    (areaDimensionIri === "" && symbolDimensionIri === "");

  const error = geoCoordinatesError ?? geoShapesError;

  const displayNoDataError =
    ready &&
    (areaDimensionIri === "" ||
      (areaDimensionIri !== "" && geometries?.length === 0)) &&
    (symbolDimensionIri === "" ||
      (symbolDimensionIri !== "" && coordinates?.length === 0)) &&
    areaDimensionIri !== symbolDimensionIri;

  return displayNoDataError ? (
    <NoGeometriesHint />
  ) : (
    <ChartDataWrapper
      dataSource={dataSource}
      error={error}
      fetching={fetchingGeoocordinates || fetchingGeoshapes}
      componentIris={componentIris}
      observationQueryFilters={queryFilters}
      Component={ChartMap}
      ComponentProps={{ shapes, coordinates }}
      chartConfig={chartConfig}
    />
  );
};

export type ChartMapProps = ChartProps<MapConfig> & {
  shapes: GeoShapes | undefined;
  coordinates: GeoCoordinates | undefined;
};

export const ChartMap = memo((props: ChartMapProps) => {
  const { chartConfig, dimensions } = props;
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
        <MapLegend chartConfig={chartConfig} />
      </ChartControlsContainer>
    </MapChart>
  );
});
