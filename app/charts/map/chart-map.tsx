import { geoCentroid } from "d3";
import React, { memo, useMemo } from "react";
import { Box } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Loading, LoadingGeoDimensionsError } from "../../components/hint";
import { BaseLayer, MapConfig, MapFields } from "../../configurator";
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
} from "../../domain/data";
import {
  DimensionMetaDataFragment,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { QueryFilters } from "../shared/chart-helpers";
import { ChartContainer } from "../shared/containers";
import { useChartData } from "../shared/use-chart-data";
import { MapComponent } from "./map";
import { MapLegend } from "./map-legend";
import { MapChart } from "./map-state";
import { MapTooltip } from "./map-tooltip";

export const ChartMapVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const { data, fetching } = useChartData({
    locale,
    iri: dataSetIri,
    filters: queryFilters,
  });

  const areaDimensionIri = chartConfig.fields.areaLayer.componentIri;
  const symbolDimensionIri = chartConfig.fields.symbolLayer.componentIri;

  const dimensions = data?.dataCubeByIri?.dimensions;
  const measures = data?.dataCubeByIri?.measures;
  const observations = data?.dataCubeByIri?.observations.data as
    | Observation[]
    | undefined;

  const [{ data: fetchedGeoCoordinates }] =
    useGeoCoordinatesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
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
    (areaLayerPrepared && areaLayer?.shapes.features.length) ||
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
      <ChartMapPrototype
        observations={observations}
        features={{ areaLayer, symbolLayer }}
        fields={chartConfig.fields}
        measures={measures}
        dimensions={dimensions}
        baseLayer={chartConfig.baseLayer}
      />
    );
  } else if (fetching || !areaLayerPrepared || !symbolLayerPrepared) {
    return <Loading />;
  } else if (!areasOrSymbolsLoaded) {
    return <LoadingGeoDimensionsError />;
  }
};

export const ChartMapPrototype = ({
  observations,
  features,
  fields,
  measures,
  dimensions,
  baseLayer,
}: {
  observations: Observation[];
  features: GeoData;
  fields: MapFields;
  measures: DimensionMetaDataFragment[];
  dimensions: DimensionMetaDataFragment[];
  baseLayer: BaseLayer;
}) => {
  return (
    <Box sx={{ m: 4, bg: "#fff" }}>
      <ChartMap
        observations={observations}
        features={features}
        fields={fields}
        measures={measures}
        dimensions={dimensions}
        baseLayer={baseLayer}
      />
    </Box>
  );
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
