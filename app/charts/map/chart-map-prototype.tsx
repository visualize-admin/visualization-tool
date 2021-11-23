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
import { Observation } from "../../domain/data";
import {
  DimensionMetaDataFragment,
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
      ], // FIXME: Other fields may also be measures
      filters: queryFilters,
    },
  });

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
        features={geoData}
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
  dimensions,
  measures,
  interactiveFiltersConfig,
  settings,
}: {
  observations: Observation[];
  features: GeoData;
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

  // Apply filters to data used on the map
  const data = useMemo(() => {
    const filterfunctions = Object.keys(filters).map(
      (filterKey) => (x: Observation) => x[filterKey] === filters[filterKey]
    );

    return filterfunctions.reduce((d, f) => d.filter(f), observations);
  }, [observations, filters]);

  return (
    <>
      {/* <Box
        sx={{
          bg: "monochrome100",
          borderRight: "1px solid",
          borderRightColor: "monochrome400",
        }}
      >
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Trans id="chart.map.control.layers">Layers</Trans>
            </Box>
            <Tab
              value="baseLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapMaptype"
              upperLabel={""}
              lowerLabel={t({
                id: "chart.map.layers.base",
                message: "Base Layer",
              })}
              checked={activeControl === "baseLayer"}
              disabled={false}
            />
            <Tab
              value="areaLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapRegions"
              upperLabel={""}
              lowerLabel={t({
                id: "chart.map.layers.area",
                message: "Area Layer",
              })}
              checked={activeControl === "areaLayer"}
              disabled={false}
            />
            <Tab
              value="symbolLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapSymbols"
              upperLabel={""}
              lowerLabel={t({
                id: "chart.map.layers.symbol",
                message: "Symbol Layer",
              })}
              checked={activeControl === "symbolLayer"}
              disabled={false}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Trans id="chart.map.control.data.filters">Data Filters</Trans>
            </Box>
            <Flex sx={{ flexDirection: "column" }}>
              {dimensions.map((dim) => (
                <Box sx={{ mb: 2 }} key={dim.iri}>
                  <Select
                    label={dim.label.split("_")[1]}
                    id={dim.label}
                    name={dim.label}
                    value={filters[dim.iri]}
                    disabled={false}
                    options={dim.values.map(({ value, label }) => ({
                      value,
                      label,
                    }))}
                    onChange={(e) =>
                      updateFilters(dim.iri, e.currentTarget.value)
                    }
                  />
                </Box>
              ))}
            </Flex>
          </Box>
        </ControlSection>
      </Box> */}

      <Box
        sx={{
          m: 4,
          bg: "#FFFFFF",
          border: "1px solid",
          borderColor: "monochrome400",
        }}
      >
        {dimensions && measures && data && (
          <ChartMap
            observations={data}
            features={features}
            fields={{
              areaLayer: {
                componentIri: measure,
                show: activeLayers["areaLayer"],
                label: { componentIri: "" },
                palette,
                nbClass,
                paletteType,
              },
              symbolLayer: {
                show: activeLayers["symbolLayer"],
                componentIri: symbolMeasure,
              },
            }}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            settings={settings}
            // Additional props (prototype only)
            measure={measure.split("_")[1]}
          />
        )}
      </Box>

      {/* <Box
        sx={{
          bg: "monochrome100",
          borderLeft: "1px solid",
          borderLeftColor: "monochrome400",
        }}
      >
        <PrototypeRightControls
          activeControl={activeControl}
          activeLayers={activeLayers}
          updateActiveLayers={updateActiveLayers}
          measures={measures}
          measure={measure}
          setMeasure={setMeasure}
          palette={palette}
          setPalette={setPalette}
          paletteType={paletteType}
          setPaletteType={setPaletteType}
          nbClass={nbClass}
          setNbClass={setNbClass}
          symbolMeasure={symbolMeasure}
          setSymbolMeasure={setSymbolMeasure}
        />
      </Box> */}
    </>
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
    measure,
  }: {
    features: GeoData;
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    interactiveFiltersConfig: InteractiveFiltersConfig;
    // Additional props (prototype only)
    fields: MapFields;
    settings: MapSettings;
    measure: string;
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
