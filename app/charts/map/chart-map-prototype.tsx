import { Trans } from "@lingui/macro";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Box, Flex } from "theme-ui";
import { feature as topojsonFeature } from "topojson-client";
import { Radio, Select } from "../../components/form";
import { HintBlue, LoadingOverlay, NoDataHint } from "../../components/hint";
import { MapFields } from "../../configurator";
import { ControlSection } from "../../configurator/components/chart-controls/section";
import { Observation } from "../../domain/data";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { ChartContainer } from "../shared/containers";
import { MapComponent } from "./map";
import { MapLegend } from "./map-legend";
import { GeoData, MapChart } from "./map-state";

type GeoDataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | {
      state: "loaded";
      municipalities: GeoJSON.FeatureCollection | GeoJSON.Feature;
      cantons: GeoJSON.FeatureCollection | GeoJSON.Feature;
      // municipalityMesh: GeoJSON.MultiLineString;
      // cantonMesh: GeoJSON.MultiLineString;
      // lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
    };
type DataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | {
      state: "loaded";
      ds: Observation[];
    };
type PaletteType = "continuous" | "discrete";

export const ChartMapVisualization = () => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [dataset, loadDataset] = useState<DataState>({ state: "fetching" });

  console.log("geoData", geoData);
  console.log("data", dataset);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();

        const municipalities = topojsonFeature(
          topo,
          topo.objects.municipalities
        );
        const cantons = topojsonFeature(topo, topo.objects.cantons);

        setGeoData({
          state: "loaded",
          municipalities,
          cantons,
        });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };
    loadGeoData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/map-data/tidy/holzernte.json`);
        const ds = await res.json();

        loadDataset({
          state: "loaded",
          ds,
        });
      } catch (e) {
        loadDataset({ state: "error" });
      }
    };
    loadData();
  }, []);

  if (geoData.state === "fetching" || dataset.state === "fetching") {
    return <LoadingOverlay />;
  } else if (geoData.state === "error" || dataset.state === "error") {
    return <NoDataHint />;
  } else {
    const dimensions = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("D_"))
      .map((d) => ({
        __typename: "NominalDimension",
        iri: d,
        label: d,
        dimensionValues: [...new Set(dataset.ds.map((datum) => datum[d]))],
      })) as Array<ComponentFieldsFragment & { dimensionValues: string[] }>;
    const measures = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("M_"))
      .map((d) => ({
        __typename: "Measure",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];
    const attributes = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("A_"))
      .map((d) => ({
        __typename: "Attribute",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];

    return (
      <ChartMapPrototype
        dataset={dataset.ds}
        features={geoData.cantons}
        dimensions={dimensions}
        measures={measures}
        attributes={attributes}
      />
    );
  }
};

export const ChartMapPrototype = ({
  dataset,
  features,
  dimensions,
  measures,
  attributes,
}: {
  dataset: Observation[];
  features: GeoData;
  dimensions: Array<ComponentFieldsFragment & { dimensionValues: string[] }>;
  measures: ComponentFieldsFragment[];
  attributes: ComponentFieldsFragment[];
}) => {
  const [palette, setPalette] = useState("oranges");
  const [nbSteps, setNbSteps] = useState(5);
  const [paletteType, setPaletteType] = useState<PaletteType>("continuous");
  const [measure, setMeasure] = useState(measures[0].iri);
  const [filters, setFilters] = useState<{ [x: string]: string }>(
    dimensions.reduce(
      (obj, dim, i) => ({ ...obj, [dim.iri]: dim.dimensionValues[0] }),
      {}
    )
  );

  const updateFilters = (filterKey: string, filterValue: string) => {
    setFilters({ ...filters, ...{ [filterKey]: filterValue } });
  };

  // Apply filters to data used on the map
  const data = useMemo(() => {
    const filterfunctions = Object.keys(
      filters
    ).map((filterKey) => (x: Observation) =>
      x[filterKey] === filters[filterKey]
    );
    return filterfunctions.reduce((d, f) => d.filter(f), dataset);
  }, [dataset, filters]);

  return (
    <>
      <Box sx={{ bg: "monochrome100", p: 4 }}>
        <Box sx={{ mb: 4 }}>Data Filters</Box>
        <Flex sx={{ flexDirection: "column" }}>
          {dimensions.map((dim) => (
            <Box sx={{ mb: 2 }}>
              <Select
                label={dim.label.split("_")[1]}
                id={dim.label}
                name={dim.label}
                value={filters[dim.iri]}
                disabled={false}
                options={dim.dimensionValues.map((value) => ({
                  value,
                  label: value,
                }))}
                onChange={(e) => updateFilters(dim.iri, e.currentTarget.value)}
              />
            </Box>
          ))}
        </Flex>
      </Box>
      <Box>
        <HintBlue iconName="hintWarning">
          <Trans id="chart.map.warning.prototype">
            This is a prototype, don't use in production!
          </Trans>
        </HintBlue>
        <Box sx={{ m: 4, bg: "#FFFFFF", border: "1px solid #eeeeee" }}>
          {dimensions && measures && data && (
            <ChartMap
              observations={data}
              features={features}
              fields={{
                x: { componentIri: attributes[0].iri },
                y: { componentIri: measure, palette, nbSteps, paletteType },
                segment: { componentIri: "c" },
              }}
              dimensions={dimensions}
              measures={measures}
              // Additional props (prototype only)
              measure={measure.split("_")[1]}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ bg: "monochrome100" }}>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Select
              label={"Select a measure to map"}
              id={"measure-select"}
              name={"measure-select"}
              value={measure}
              disabled={false}
              options={measures.map((m) => ({
                value: m.iri,
                label: m.label.split("_")[1],
              }))}
              onChange={(e) => setMeasure(e.currentTarget.value)}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Select
              label={"Farbpalette"}
              id={"palette"}
              name={"palette"}
              value={palette}
              disabled={false}
              options={[
                { value: "oranges", label: "oranges" },
                { value: "reds", label: "reds" },
                { value: "purples", label: "purples" },
                { value: "greens", label: "greens" },
                { value: "blues", label: "blues" },
                { value: "greys", label: "greys" },
              ]}
              onChange={(e) => setPalette(e.currentTarget.value)}
            ></Select>
            <Radio
              label={"Kontinuerlich"}
              name={"continuous"}
              value={"continuous"}
              checked={paletteType === "continuous"}
              disabled={false}
              onChange={(e) => {
                setPaletteType(e.currentTarget.value as PaletteType);
              }}
            />
            <Radio
              label={"Sequentiell"}
              name={"discrete"}
              value={"discrete"}
              checked={paletteType === "discrete"}
              disabled={false}
              onChange={(e) =>
                setPaletteType(e.currentTarget.value as PaletteType)
              }
            />
            <Select
              label={"Anzahl Schritte"}
              id={"nbSteps"}
              name={"nbSteps"}
              value={`${nbSteps}`}
              disabled={paletteType === "continuous"}
              options={[
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
                { value: "9", label: "9" },
              ]}
              onChange={(e) => setNbSteps(+e.currentTarget.value)}
            ></Select>
          </Box>
        </ControlSection>
      </Box>
    </>
  );
};

export const ChartMap = memo(
  ({
    observations,
    features,
    dimensions,
    measures,
    fields,
    measure,
  }: {
    features: GeoData;
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    // Additional props (prototype only)
    fields: MapFields;
    measure: string;
  }) => {
    return (
      <MapChart
        data={observations}
        features={features}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
      >
        <ChartContainer>
          <MapComponent />
        </ChartContainer>
        <MapLegend legendTitle={measure} />
      </MapChart>
    );
  }
);
