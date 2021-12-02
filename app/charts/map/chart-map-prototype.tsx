import { geoCentroid } from "d3";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Box } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Loading, LoadingOverlay, NoDataHint } from "../../components/hint";
import {
  InteractiveFiltersConfig,
  MapConfig,
  MapFields,
  MapSettings,
} from "../../configurator";
import { GeoShapes, Observation } from "../../domain/data";
import {
  DimensionMetaDataFragment,
  GeoDimension,
  useDataCubeObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
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

export interface GeoShapeFeature {
  type: "Feature";
  properties: {
    iri: string;
    label: string;
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
  const [{ data, fetching, error }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      measures: [
        chartConfig.fields.areaLayer.componentIri,
        chartConfig.fields.symbolLayer?.componentIri,
      ],
      filters: queryFilters,
    },
  });

  const geoDimension = data?.dataCubeByIri?.dimensions.find(
    (d) => d.__typename === "GeoDimension"
  ) as GeoDimension | undefined;

  const areaLayer = useMemo(() => {
    if (geoDimension) {
      const geoShapes = geoDimension.geoShapes as GeoShapes;

      return {
        shapes: topojsonFeature(
          geoShapes,
          geoShapes.objects.shapes
        ) as GeoJSON.FeatureCollection,
        mesh: topojsonMesh(geoShapes, geoShapes.objects.shapes as any),
      };
    }
  }, [geoDimension]);

  const symbolLayer = useMemo(() => {
    return areaLayer?.shapes.features.map((d) => ({
      coordinates: geoCentroid(d),
      iri: d.properties!.iri,
      label: d.properties!.label,
    }));
  }, [areaLayer]);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();

        const lakes = topojsonFeature(topo, topo.objects.lakes);

        setGeoData({
          state: "loaded",
          lakes,
        });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };

    loadGeoData();
  }, []);

  if (data?.dataCubeByIri && geoData.state === "loaded") {
    const { title, dimensions, measures, observations } = data?.dataCubeByIri;

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
    return <LoadingOverlay />;
  } else if (geoData.state === "error" || error) {
    return <NoDataHint />;
  } else {
    return <Loading />;
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
