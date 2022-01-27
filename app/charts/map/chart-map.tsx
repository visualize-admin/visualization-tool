import { geoCentroid } from "d3";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Box } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Loading, LoadingDataError, NoDataHint } from "../../components/hint";
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
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { GeoCoordinates } from "../../rdf/query-geo-coordinates";
import { QueryFilters } from "../shared/chart-helpers";
import { ChartContainer } from "../shared/containers";
import { MapComponent } from "./map";
import { MapLegend } from "./map-legend";
import { MapChart } from "./map-state";
import { MapTooltip } from "./map-tooltip";

type GeoDataState =
  | { state: "fetching" }
  | { state: "error" }
  | (GeoData & { state: "loaded" });

export const ChartMapVisualization = ({
  dataSetIri,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
}) => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const locale = useLocale();

  const areaDimensionIri = chartConfig.fields.areaLayer.componentIri;
  const symbolDimensionIri = chartConfig.fields.symbolLayer.componentIri;

  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [areaDimensionIri, symbolDimensionIri],
      filters: queryFilters,
    },
  });

  const dimensions = data?.dataCubeByIri?.dimensions;
  const measures = data?.dataCubeByIri?.measures;
  const observations = data?.dataCubeByIri?.observations.data as
    | Observation[]
    | undefined;

  const areaLayer: AreaLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === areaDimensionIri);

    if (isGeoShapesDimension(dimension) && observations) {
      const { topology } = dimension.geoShapes as GeoShapes;

      const topojson = topojsonFeature(
        topology,
        topology.objects.shapes
      ) as AreaLayer["shapes"];

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
  }, [areaDimensionIri, dimensions, observations]);

  const symbolLayer: SymbolLayer | undefined = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === symbolDimensionIri);

    if (isGeoCoordinatesDimension(dimension)) {
      const points = (dimension.geoCoordinates as GeoCoordinates[]).map(
        (d) =>
          ({
            coordinates: [d.longitude, d.latitude],
            properties: {
              iri: d.iri,
              label: d.label,
              observation: observations?.find(
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
  }, [areaLayer, dimensions, observations, symbolDimensionIri]);

  useEffect(() => {
    const loadLakes = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();
        const lakes = topojsonFeature(
          topo,
          topo.objects.lakes
        ) as any as GeoJSON.FeatureCollection;

        setGeoData({ state: "loaded", lakes });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };

    loadLakes();
  }, []);

  if (measures && dimensions && observations && geoData.state === "loaded") {
    return (
      <ChartMapPrototype
        observations={observations}
        features={{ ...geoData, areaLayer, symbolLayer }}
        fields={chartConfig.fields}
        measures={measures}
        dimensions={dimensions}
        baseLayer={chartConfig.baseLayer}
      />
    );
  } else if (geoData.state === "fetching" || fetching) {
    return <Loading />;
  } else if (geoData.state === "error" || error) {
    return <LoadingDataError />;
  } else {
    return <NoDataHint />;
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
