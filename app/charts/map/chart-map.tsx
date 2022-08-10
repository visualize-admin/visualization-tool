import { Box } from "@mui/material";
import { geoCentroid } from "d3";
import React, { memo, useMemo } from "react";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";

import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import { QueryFilters } from "@/charts/shared/chart-helpers";
import { ChartContainer } from "@/charts/shared/containers";
import {
  Loading,
  LoadingDataError,
  LoadingGeoDimensionsError,
  NoDataHint,
} from "@/components/hint";
import { BaseLayer, MapConfig, MapFields } from "@/configurator";
import {
  AreaLayer,
  GeoData,
  GeoFeature,
  GeoPoint,
  GeoShapes,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
  Observation,
  SymbolLayer,
} from "@/domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { DataSource } from "@/graphql/resolvers/utils";
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
  const areaDimensionIri = chartConfig.fields.areaLayer.componentIri;
  const symbolDimensionIri = chartConfig.fields.symbolLayer.componentIri;
  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
      filters: queryFilters,
    },
  });

  const dimensions = data?.dataCubeByIri?.dimensions;
  const measures = data?.dataCubeByIri?.measures;
  const observations = data?.dataCubeByIri?.observations.data as
    | Observation[]
    | undefined;

  const [{ data: fetchedGeoCoordinates }] =
    useGeoCoordinatesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: symbolDimensionIri,
        locale,
      },
    });

  const geoCoordinates =
    fetchedGeoCoordinates?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoCoordinatesDimension"
      ? fetchedGeoCoordinates.dataCubeByIri.dimensionByIri.geoCoordinates
      : undefined;

  const [{ data: fetchedGeoShapes }] = useGeoShapesByDimensionIriQuery({
    variables: {
      dataCubeIri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      dimensionIri: areaDimensionIri,
      locale,
    },
  });

  const geoShapes =
    fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoShapesDimension"
      ? (fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes as GeoShapes)
      : undefined;

  const areaLayer: AreaLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === areaDimensionIri);

    if (isGeoShapesDimension(dimension) && geoShapes && observations) {
      const activeFilters = chartConfig.filters[areaDimensionIri];
      const activeFiltersIris = activeFilters
        ? activeFilters.type === "single"
          ? [activeFilters.value]
          : activeFilters.type === "multi"
          ? Object.keys(activeFilters.values)
          : undefined
        : undefined;

      const { topology } = geoShapes;
      const topojson = topojsonFeature(
        topology,
        topology.objects.shapes
      ) as AreaLayer["shapes"];

      // Completely hide unselected shapes (so they don't affect the legend, etc)
      if (activeFiltersIris) {
        topojson.features = topojson.features.filter((d) =>
          activeFiltersIris.includes(d.properties.iri)
        );
      }

      topojson.features.forEach((d: GeoFeature) => {
        // Should we match by labels?
        const observation = observations.find(
          (o) => o[areaDimensionIri] === d.properties.label
        );

        d.properties = { ...d.properties, observation };
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
    geoShapes,
  ]);

  const symbolLayer: SymbolLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === symbolDimensionIri);

    if (
      isGeoCoordinatesDimension(dimension) &&
      geoCoordinates &&
      observations
    ) {
      const points = geoCoordinates.map(
        (d) =>
          ({
            coordinates: [d.longitude, d.latitude],
            properties: {
              iri: d.iri,
              label: d.label,
              observation: observations.find(
                (o) => o[symbolDimensionIri] === d.label
              ),
            },
          } as GeoPoint)
      );

      return { points };
    } else {
      if (areaLayer) {
        const points = areaLayer.shapes.features.map((d) => ({
          ...d,
          coordinates: geoCentroid(d),
        }));

        return { points };
      }
    }
  }, [areaLayer, dimensions, observations, symbolDimensionIri, geoCoordinates]);

  const areaLayerPrepared =
    areaDimensionIri !== "" ? areaLayer !== undefined : true;
  const symbolLayerPrepared =
    symbolDimensionIri !== "" ? symbolLayer !== undefined : true;

  const areasOrSymbolsLoaded =
    (areaLayerPrepared &&
      // check if original, unfiltered number of shapes is bigger than 0
      (geoShapes?.topology?.objects?.shapes as any)?.geometries?.length) ||
    (symbolLayerPrepared && symbolLayer?.points.length);

  if (
    measures &&
    dimensions &&
    observations &&
    areaLayerPrepared &&
    symbolLayerPrepared &&
    areasOrSymbolsLoaded
  ) {
    return (
      <Box data-chart-loaded={!fetching} sx={{ m: 4, backgroundColor: "#fff" }}>
        <ChartMap
          observations={observations}
          features={{ areaLayer, symbolLayer }}
          fields={chartConfig.fields}
          measures={measures}
          dimensions={dimensions}
          baseLayer={chartConfig.baseLayer}
        />
      </Box>
    );
  } else if (fetching || !areaLayerPrepared || !symbolLayerPrepared) {
    return <Loading />;
  } else if (error) {
    return <LoadingDataError />;
  } else if (!areasOrSymbolsLoaded) {
    return <LoadingGeoDimensionsError />;
  } else {
    return <NoDataHint />;
  }
};

export const ChartMap = memo(
  ({
    observations,
    features,
    fields,
    measures,
    dimensions,
    baseLayer,
  }: {
    features: GeoData;
    observations: Observation[];
    measures: DimensionMetaDataFragment[];
    dimensions: DimensionMetaDataFragment[];
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
  }
);
