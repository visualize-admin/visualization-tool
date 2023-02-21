import { geoCentroid } from "d3";
import keyBy from "lodash/keyBy";
import React, { useMemo } from "react";
import { mesh as topojsonMesh } from "topojson-client";

import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import { ChartContainer } from "@/charts/shared/containers";
import {
  BaseLayer,
  DataSource,
  MapConfig,
  MapFields,
  QueryFilters,
} from "@/configurator/config-types";
import {
  AreaLayer,
  GeoData,
  GeoPoint,
  GeoShapes,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
  Observation,
  SymbolLayer,
} from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

import { prepareTopojson } from "./helpers";

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
  const [observationsQueryResp] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
      filters: queryFilters,
    },
  });
  const {
    data,
    fetching,
    error: observationsQueryError,
  } = observationsQueryResp;

  const dimensions = data?.dataCubeByIri?.dimensions;
  const measures = data?.dataCubeByIri?.measures;
  const observations = data?.dataCubeByIri?.observations.data as
    | Observation[]
    | undefined;

  const [{ data: fetchedGeoCoordinates, error: geoCoordinatesError }] =
    useGeoCoordinatesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: symbolDimensionIri,
        locale,
      },
    });

  const geoCoordinatesDimension =
    fetchedGeoCoordinates?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoCoordinatesDimension"
      ? fetchedGeoCoordinates.dataCubeByIri.dimensionByIri.geoCoordinates
      : undefined;

  const [{ data: fetchedGeoShapes }] = useGeoShapesByDimensionIriQuery({
    variables: {
      dataCubeIri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      dimensionIri: areaDimensionIri || symbolDimensionIri,
      locale,
    },
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

  const queryResp = {
    fetching,
    data:
      measures &&
      dimensions &&
      observations &&
      areaLayerPrepared &&
      symbolLayerPrepared &&
      ready
        ? observationsQueryResp["data"]
        : undefined,
    error: observationsQueryError || geoCoordinatesError,
  };
  return (
    <ChartLoadingWrapper
      query={queryResp}
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
  fields,
  measures,
  dimensions,
  baseLayer,
}: {
  features: GeoData;
  observations: Observation[];
  measures: DimensionMetadataFragment[];
  dimensions: DimensionMetadataFragment[];
  fields: MapFields;
  baseLayer: BaseLayer;
}) => {
  return (
    <MapChart
      data={observations}
      features={features}
      fields={fields}
      measures={measures}
      dimensions={dimensions}
      baseLayer={baseLayer}
    >
      <ChartContainer>
        <MapComponent />
        <MapTooltip />
      </ChartContainer>
      <MapLegend />
    </MapChart>
  );
};
