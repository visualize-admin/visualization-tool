import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import {
  ChartContainer,
  ChartControlsContainer,
} from "@/charts/shared/containers";
import { DataSource, MapConfig, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { GeoShapes } from "@/domain/data";
import {
  GeoCoordinates,
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartMapVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
  published: boolean;
}) => {
  const locale = useLocale();
  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";
  const commonQueryVariables = {
    iri: dataSetIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const componentIris = published
    ? extractComponentIris(chartConfig)
    : undefined;
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsQuery] = useComponentsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
      filters: queryFilters,
    },
  });
  const { data: componentsData } = componentsQuery;
  const { data: observationsData } = observationsQuery;

  const dimensions = componentsData?.dataCubeByIri?.dimensions;
  const measures = componentsData?.dataCubeByIri?.measures;
  const observations = observationsData?.dataCubeByIri?.observations.data;

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

  const ready =
    (areaDimensionIri !== "" &&
      // Check if original, unfiltered number of shapes is bigger than 0.
      (shapes?.topology?.objects?.shapes as any)?.geometries?.length) ||
    (symbolDimensionIri !== "" && coordinates?.length) ||
    (shapes?.topology?.objects?.shapes as any)?.geometries?.length ||
    // Raw map without any data layer.
    (areaDimensionIri === "" && symbolDimensionIri === "");

  const observationsQueryResp = {
    ...observationsQuery,
    data:
      measures && dimensions && observations && ready
        ? observationsQuery["data"]
        : undefined,
    error: observationsQuery.error ?? geoCoordinatesError ?? geoShapesError,
  };

  return (
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

export const ChartMap = (
  props: ChartProps<MapConfig> & {
    shapes: GeoShapes | undefined;
    coordinates: GeoCoordinates[] | undefined | null;
  }
) => {
  const { chartConfig, dimensions } = props;
  const { fields } = chartConfig;

  return (
    <MapChart {...props}>
      <ChartContainer>
        <MapComponent />
        <MapTooltip />
      </ChartContainer>
      <ChartControlsContainer sx={{ mt: 6 }}>
        {fields.animation && (
          <TimeSlider
            componentIri={fields.animation.componentIri}
            dimensions={dimensions}
            showPlayButton={fields.animation.showPlayButton}
            animationDuration={fields.animation.duration}
            animationType={fields.animation.type}
          />
        )}
        <MapLegend chartConfig={chartConfig} />
      </ChartControlsContainer>
    </MapChart>
  );
};
