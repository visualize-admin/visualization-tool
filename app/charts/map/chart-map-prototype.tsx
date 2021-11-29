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
  PaletteType,
} from "../../configurator";
import { GeoShape, Observation } from "../../domain/data";
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
      return {
        type: "FeatureCollection",
        features: geoDimension.geoShapes.map(
          (d: GeoShape) =>
            ({
              type: "Feature",
              properties: {
                iri: d.iri,
                label: d.label,
              },
              geometry: d.geometry,
            } as GeoShapeFeature)
        ),
      } as GeoJSON.FeatureCollection;
    }
  }, [geoDimension]);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();

        const cantons = topojsonFeature(topo, topo.objects.cantons);
        const cantonMesh = topojsonMesh(topo, topo.objects.cantons);
        const lakes = topojsonFeature(topo, topo.objects.lakes);
        const cantonCentroids = (cantons as $FixMe).features.map(
          (c: $FixMe) => ({
            id: c.id,
            coordinates: geoCentroid(c),
          })
        );

        setGeoData({
          state: "loaded",
          cantons,
          cantonMesh,
          cantonCentroids,
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
        features={{ ...geoData, areaLayer }}
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
  const [activeLayers, setActiveLayers] = useState<ActiveLayer>({
    relief: true,
    lakes: true,
    areaLayer: false,
    symbolLayer: false,
  });
  const [activeControl, setActiveControl] = useState<Control>("baseLayer");
  const [palette, setPalette] = useState("oranges");
  const [nbClass, setNbClass] = useState(5);
  const [paletteType, setPaletteType] = useState<PaletteType>("continuous");
  const [measure, setMeasure] = useState(measures[0].iri);
  const [symbolMeasure, setSymbolMeasure] = useState(measures[0].iri);
  const [filters, setFilters] = useState<{ [x: string]: string }>(
    dimensions.reduce(
      (obj, dim, i) => ({ ...obj, [dim.iri]: dim.values[0] }),
      {}
    )
  );

  const updateActiveLayers = (layerKey: keyof ActiveLayer) => {
    setActiveLayers({
      ...activeLayers,
      ...{ [layerKey]: !activeLayers[layerKey] },
    });
  };
  const updateFilters = (filterKey: string, filterValue: string) => {
    setFilters({ ...filters, ...{ [filterKey]: filterValue } });
  };

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
