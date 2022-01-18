import { geoCentroid } from "d3";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Box } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Loading, LoadingDataError, NoDataHint } from "../../components/hint";
import { MapConfig, MapFields, MapSettings } from "../../configurator";
import {
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
  Observation,
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
import { GeoData, MapChart } from "./map-state";
import { MapTooltip } from "./map-tooltip";

type GeoDataState =
  | { state: "fetching" }
  | { state: "error" }
  | (GeoData & { state: "loaded" });

export interface ShapeFeature {
  type: "Feature";
  properties: {
    iri: string;
    label: string;
    hierarchyLevel: number;
    observation: Observation;
  };
  geometry: GeoJSON.Geometry;
}

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
  const observations = data?.dataCubeByIri?.observations.data;

  const areaLayer = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === areaDimensionIri);

    if (isGeoShapesDimension(dimension)) {
      const { hierarchy, topology } = dimension.geoShapes;

      const topojson = topojsonFeature(
        topology,
        topology.objects.shapes
      ) as any;

      topojson.features.forEach((d: any) => {
        // Should we match by labels?
        d.properties.observation = observations?.find(
          (o: any) => o[areaDimensionIri] === d.properties.label
        );
        d.properties.hierarchyLevel = hierarchy.find(
          (h: any) => h.iri === d.properties.iri
        )!.level;
      });

      return {
        shapes: topojson,
        mesh: topojsonMesh(topology, topology.objects.shapes),
      };
    }
  }, [areaDimensionIri, dimensions, observations]);

  const symbolLayer = useMemo(() => {
    const dimension = dimensions?.find((d) => d.iri === symbolDimensionIri);

    if (isGeoCoordinatesDimension(dimension)) {
      return (dimension.geoCoordinates as GeoCoordinates[]).map((d) => ({
        coordinates: [d.longitude, d.latitude],
        properties: {
          iri: d.iri,
          label: d.label,
          observation: observations?.find(
            (o) => o[symbolDimensionIri] === d.label
          ),
        },
      }));
    } else {
      if (areaLayer) {
        return areaLayer.shapes.features.map((d: any) => ({
          ...d,
          coordinates: geoCentroid(d),
        }));
      }
    }
  }, [areaLayer, dimensions, observations, symbolDimensionIri]);

  useEffect(() => {
    const loadLakes = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();
        const lakes = topojsonFeature(topo, topo.objects.lakes);

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
        settings={chartConfig.settings}
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
  settings,
}: {
  observations: Observation[];
  features: GeoData;
  fields: MapFields;
  measures: DimensionMetaDataFragment[];
  dimensions: DimensionMetaDataFragment[];
  settings: MapSettings;
}) => {
  return (
    <Box
      sx={{
        m: 4,
        bg: "#fff",
        border: "1px solid",
        borderColor: "monochrome400",
      }}
    >
      <ChartMap
        observations={observations}
        features={features}
        fields={fields}
        measures={measures}
        dimensions={dimensions}
        settings={settings}
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
    settings,
  }: {
    features: GeoData;
    observations: Observation[];
    measures: DimensionMetaDataFragment[];
    dimensions: DimensionMetaDataFragment[];
    fields: MapFields;
    settings: MapSettings;
  }) => {
    return (
      <MapChart
        data={observations}
        features={features}
        fields={fields}
        measures={measures}
        dimensions={dimensions}
        settings={settings}
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
