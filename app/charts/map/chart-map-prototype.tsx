import { geoCentroid } from "d3";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Box } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Loading, LoadingDataError, NoDataHint } from "../../components/hint";
import {
  InteractiveFiltersConfig,
  MapConfig,
  MapFields,
  MapSettings,
} from "../../configurator";
import {
  GeoPoint,
  GeoShapes,
  getGeoCoordinatesDimensions,
  getGeoShapesDimensions,
  Observation,
} from "../../domain/data";
import {
  DimensionMetaDataFragment,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { RawGeoCoordinates } from "../../rdf/query-geo-coordinates";
import { QueryFilters } from "../shared/chart-helpers";
import { ChartContainer } from "../shared/containers";
import { MapComponent } from "./map";
import { MapLegend } from "./map-legend";
import { GeoData, MapChart } from "./map-state";
import { MapTooltip } from "./map-tooltip";

type GeoDataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | (GeoData & { state: "loaded" });

export interface ShapeFeature {
  type: "Feature";
  properties: {
    iri: string;
    label: string;
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

  const areaLayerComponentIri = chartConfig.fields.areaLayer.componentIri;
  const symbolLayerComponentIri = chartConfig.fields.symbolLayer.componentIri;

  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [areaLayerComponentIri, symbolLayerComponentIri],
      filters: queryFilters,
    },
  });
  const dimensions = data?.dataCubeByIri?.dimensions;
  const observations = data?.dataCubeByIri?.observations.data;

  const areaLayerDimension = dimensions?.find(
    (d) => d.iri === areaLayerComponentIri
  ) as GeoShapesDimension | undefined;

  const areaLayer = useMemo(() => {
    if (areaLayerDimension) {
      const rawShapes = areaLayerDimension.geoShapes as GeoShapes;
      const topojsonShapes = topojsonFeature(
        rawShapes,
        rawShapes.objects.shapes
      ) as GeoJSON.FeatureCollection<
        GeoJSON.GeometryObject,
        ShapeFeature["properties"]
      >;

      topojsonShapes.features.forEach((d) => {
        // Should we match by labels?
        d.properties.observation = observations?.find(
          (o) => o[areaLayerComponentIri] === d.properties.label
        );
      });

      return {
        shapes: topojsonShapes,
        mesh: topojsonMesh(rawShapes, rawShapes.objects.shapes as any),
      };
    }
  }, [areaLayerComponentIri, areaLayerDimension, observations]);

  const symbolLayer = useMemo(() => {
    if (dimensions) {
      const geoCoordinatesDimensions = getGeoCoordinatesDimensions(dimensions);

      if (geoCoordinatesDimensions.length) {
        const geoCoordinatesDimension = dimensions.find(
          (d) => d.iri === symbolLayerComponentIri
        ) as GeoCoordinatesDimension | undefined;

        if (geoCoordinatesDimension) {
          return (
            geoCoordinatesDimension.geoCoordinates as RawGeoCoordinates[]
          ).map(
            (d) =>
              ({
                coordinates: [+d.longitude!, +d.latitude!],
                properties: {
                  iri: d.iri,
                  label: d.label,
                  observation: observations?.find(
                    (o) => o[symbolLayerComponentIri] === d.label
                  ),
                },
              } as GeoPoint)
          );
        }
      } else {
        const geoShapesDimensions = getGeoShapesDimensions(dimensions);

        if (geoShapesDimensions.length && areaLayer) {
          return areaLayer.shapes.features.map((d) => ({
            ...d,
            coordinates: geoCentroid(d),
          }));
        } else {
          return;
        }
      }
    }
  }, [areaLayer, dimensions, observations, symbolLayerComponentIri]);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();
        const lakes = topojsonFeature(topo, topo.objects.lakes);

        setGeoData({ state: "loaded", lakes });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };

    loadGeoData();
  }, []);

  if (data?.dataCubeByIri && geoData.state === "loaded") {
    const { dimensions, measures, observations } = data?.dataCubeByIri;

    return (
      <ChartMapPrototype
        observations={observations.data}
        features={{ ...geoData, areaLayer, symbolLayer }}
        fields={chartConfig.fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={chartConfig.interactiveFiltersConfig}
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

export type Control = "baseLayer" | "areaLayer" | "symbolLayer";
export type ActiveLayer = {
  relief: boolean;
  lakes: boolean;
  areaLayer: boolean;
  symbolLayer: boolean;
};

export const ChartMapPrototype = ({
  observations,
  features,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  settings,
}: {
  observations: Observation[];
  features: GeoData;
  fields: MapFields;
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
  interactiveFiltersConfig: InteractiveFiltersConfig;
  settings: MapSettings;
}) => {
  return (
    <Box
      sx={{
        m: 4,
        bg: "#FFFFFF",
        border: "1px solid",
        borderColor: "monochrome400",
      }}
    >
      {dimensions && measures && (
        <ChartMap
          observations={observations}
          features={features}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          settings={settings}
        />
      )}
    </Box>
  );
};

export const ChartMap = memo(
  ({
    observations,
    features,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    settings,
  }: {
    features: GeoData;
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    interactiveFiltersConfig: InteractiveFiltersConfig;
    fields: MapFields;
    settings: MapSettings;
  }) => {
    return (
      <MapChart
        data={observations}
        features={features}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
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
