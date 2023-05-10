import { geoCentroid } from "d3";
import keyBy from "lodash/keyBy";
import { useMemo } from "react";
import { mesh as topojsonMesh } from "topojson-client";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { prepareTopojson } from "@/charts/map/helpers";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import { getChartConfigComponents } from "@/charts/shared/chart-helpers";
import { ChartContainer } from "@/charts/shared/containers";
import {
  BaseLayer,
  DataSource,
  MapConfig,
  QueryFilters,
} from "@/configurator/config-types";
import {
  AreaLayer,
  GeoData,
  GeoPoint,
  GeoShapes,
  Observation,
  SymbolLayer,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
} from "@/domain/data";
import {
  DimensionMetadataFragment,
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartMapVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [componentsQuery] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris: getChartConfigComponents(chartConfig),
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
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

  const geoCoordinatesDimension =
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

  const geoShapesDimension =
    fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoShapesDimension"
      ? (fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes as GeoShapes)
      : undefined;

  const areaLayer: AreaLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === areaDimensionIri);

    if (isGeoShapesDimension(dimension) && geoShapesDimension && observations) {
      const { topology } = geoShapesDimension;
      const topojson = prepareTopojson({
        dimensionIri: areaDimensionIri,
        topology,
        filters: chartConfig.filters[areaDimensionIri],
        observations,
      });

      return {
        shapes: topojson,
        mesh: topojsonMesh(topology, topology.objects.shapes),
      };
    }
  }, [
    areaDimensionIri,
    dimensions,
    chartConfig.filters,
    observations,
    geoShapesDimension,
  ]);

  const symbolLayer: SymbolLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === symbolDimensionIri);

    if (
      isGeoCoordinatesDimension(dimension) &&
      geoCoordinatesDimension &&
      observations
    ) {
      const points: GeoPoint[] = [];
      const coordsByLabel = keyBy(geoCoordinatesDimension, (d) => d.label);

      observations.forEach((observation) => {
        const label = observation[symbolDimensionIri] as string;
        const coords = coordsByLabel[label];

        if (coords) {
          const { iri, label, latitude, longitude } = coords;
          points.push({
            coordinates: [longitude, latitude] as [number, number],
            properties: {
              iri,
              label,
              observation,
            },
          });
        }
      });

      return { points };
    } else {
      if (
        isGeoShapesDimension(dimension) &&
        geoShapesDimension &&
        observations
      ) {
        const { topology } = geoShapesDimension;
        const topojson = prepareTopojson({
          dimensionIri: symbolDimensionIri,
          topology,
          filters: chartConfig.filters[symbolDimensionIri],
          observations,
        });

        const points = topojson.features.map((d) => ({
          ...d,
          coordinates: geoCentroid(d),
        }));

        return { points };
      }
    }
  }, [
    symbolDimensionIri,
    chartConfig.filters,
    dimensions,
    geoShapesDimension,
    observations,
    geoCoordinatesDimension,
  ]);

  const areaLayerPrepared =
    areaDimensionIri !== "" ? areaLayer !== undefined : true;
  const symbolLayerPrepared =
    symbolDimensionIri !== "" ? symbolLayer !== undefined : true;

  const ready =
    (areaLayerPrepared &&
      // check if original, unfiltered number of shapes is bigger than 0
      (geoShapesDimension?.topology?.objects?.shapes as any)?.geometries
        ?.length) ||
    (symbolLayerPrepared && symbolLayer?.points.length) ||
    // Raw map without any data layer.
    (areaDimensionIri === "" && symbolDimensionIri === "");

  const observationsQueryResp = {
    ...observationsQuery,
    data:
      measures &&
      dimensions &&
      observations &&
      areaLayerPrepared &&
      symbolLayerPrepared &&
      ready
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
      ComponentProps={{
        features: { areaLayer, symbolLayer },
        baseLayer: chartConfig.baseLayer,
      }}
      chartConfig={chartConfig}
    />
  );
};

export const ChartMap = ({
  observations,
  features,
  chartConfig,
  measures,
  dimensions,
  baseLayer,
}: {
  features: GeoData;
  observations: Observation[];
  measures: DimensionMetadataFragment[];
  dimensions: DimensionMetadataFragment[];
  chartConfig: MapConfig;
  baseLayer: BaseLayer;
}) => {
  return (
    <MapChart
      data={observations}
      features={features}
      measures={measures}
      dimensions={dimensions}
      baseLayer={baseLayer}
      chartConfig={chartConfig}
    >
      <ChartContainer>
        <MapComponent />
        <MapTooltip />
      </ChartContainer>
      <MapLegend chartConfig={chartConfig} />
    </MapChart>
  );
};
