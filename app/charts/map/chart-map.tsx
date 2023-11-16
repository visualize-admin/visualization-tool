import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import {
  ChartContainer,
  ChartControlsContainer,
} from "@/charts/shared/containers";
import { NoGeometriesHint } from "@/components/hint";
import { DataSource, MapConfig, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { GeoShapes } from "@/domain/data";
import {
  GeoCoordinates,
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartMapVisualization = ({
  dataSetIri,
  dataSource,
  componentIris,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
    filters: [{ iri: dataSetIri, componentIris, filters: queryFilters }],
  };
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: commonQueryVariables,
  });
  const [observationsQuery] = useDataCubesObservationsQuery({
    variables: commonQueryVariables,
  });
  const { data: componentsData } = componentsQuery;
  const { data: observationsData } = observationsQuery;

  const dimensions = componentsData?.dataCubesComponents?.dimensions;
  const measures = componentsData?.dataCubesComponents?.measures;
  const observations = observationsData?.dataCubesObservations?.data;

  const [{ data: fetchedGeoCoordinates, error: geoCoordinatesError }] =
    useGeoCoordinatesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: symbolDimensionIri,
        locale,
      },
      pause: !symbolDimensionIri || symbolDimensionIri === "",
    });

  const coordinates =
    fetchedGeoCoordinates?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoCoordinatesDimension"
      ? fetchedGeoCoordinates.dataCubeByIri.dimensionByIri.geoCoordinates
      : undefined;

  const geoShapesIri = areaDimensionIri || symbolDimensionIri;
  const [{ data: fetchedGeoShapes, error: geoShapesError }] =
    useGeoShapesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: geoShapesIri,
        locale,
      },
      pause: !geoShapesIri || geoShapesIri === "",
    });

  const shapes =
    fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoShapesDimension"
      ? (fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes as GeoShapes)
      : undefined;
  const geometries: any[] | undefined = (
    shapes?.topology?.objects?.shapes as any
  )?.geometries;

  const ready =
    (areaDimensionIri !== "" && geometries) ||
    (symbolDimensionIri !== "" && coordinates) ||
    geometries ||
    // Raw map without any data layer.
    (areaDimensionIri === "" && symbolDimensionIri === "");

  const observationsQueryResp = {
    ...observationsQuery,
    data:
      measures && dimensions && observations && ready
        ? observationsQuery.data
        : undefined,
    error: observationsQuery.error ?? geoCoordinatesError ?? geoShapesError,
  };

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
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQueryResp}
      Component={ChartMap}
      ComponentProps={{ shapes, coordinates }}
      chartConfig={chartConfig}
    />
  );
};

export const ChartMap = memo(
  (
    props: ChartProps<MapConfig> & {
      shapes: GeoShapes | undefined;
      coordinates: GeoCoordinates[] | undefined | null;
    }
  ) => {
    const { chartConfig, dimensions } = props;
    const { fields, filters } = chartConfig;

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
  }
);
