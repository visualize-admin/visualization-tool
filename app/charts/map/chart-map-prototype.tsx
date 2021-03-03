import React, { memo, useEffect, useState } from "react";
import { Box } from "theme-ui";
import { feature as topojsonFeature } from "topojson-client";
import { Radio, Select } from "../../components/form";
import { LoadingOverlay, NoDataHint } from "../../components/hint";
import { MapFields } from "../../configurator";
import { ColorRamp } from "../../configurator/components/chart-controls/color-ramp";
import { getColorInterpolator } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";

import { ChartContainer } from "../shared/containers";
import { MapComponent } from "./map";
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
      ds: $FixMe;
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
        const res = await fetch(`/map-data/tidy/holzernte-simple.json`);
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
    return (
      <ChartMapPrototype dataset={dataset.ds} features={geoData.cantons} />
    );
  }
};

export const ChartMapPrototype = ({
  dataset,
  features,
}: {
  dataset: Observation[];
  features: GeoData;
}) => {
  const [palette, setPalette] = useState("oranges");
  const [nbSteps, setNbSteps] = useState(512);
  const [paletteType, setPaletteType] = useState<PaletteType>("continuous");
  const [dimensions, setDimensions] = useState<ComponentFieldsFragment[]>();
  const [measures, setMeasures] = useState<ComponentFieldsFragment[]>();
  // const [data, setData] = useState<Observation[]>();
  useEffect(() => {
    const dimensions = Object.keys(dataset[0])
      .filter((d) => d.startsWith("D_"))
      .map((d) => ({
        __typename: "NominalDimension",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];
    setDimensions(dimensions);

    const measures = Object.keys(dataset[0])
      .filter((d) => d.startsWith("M_"))
      .map((d) => ({
        __typename: "Measure",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];
    setMeasures(measures);
  }, [dataset]);

  // useEffect(() => {
  //   const data = data.filter(d => dimensions?.map(dim => d[]))
  // }, [dataset, dimensions])
  return (
    <>
      <Box sx={{ bg: "monochrome100" }}></Box>
      <Box sx={{ m: 4, border: "1px solid hotpink", bg: "#FFFFFF" }}>
        {dimensions && measures && (
          <ChartMap
            observations={dataset}
            features={features}
            fields={{
              x: { componentIri: "a" },
              y: { componentIri: "b", palette, nbSteps, paletteType },
              segment: { componentIri: "c" },
            }}
            dimensions={dimensions}
            measures={measures}
          />
        )}
      </Box>
      <Box sx={{ bg: "monochrome100", p: 4 }}>
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
            // setNbSteps(null)
          }}
        />
        <Radio
          label={"Sequentiell"}
          name={"discrete"}
          value={"discrete"}
          checked={paletteType === "discrete"}
          disabled={false}
          onChange={(e) => setPaletteType(e.currentTarget.value as PaletteType)}
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

        <ColorRamp
          colorInterpolator={getColorInterpolator(palette)}
          nbSteps={paletteType === "discrete" ? nbSteps : 512}
          height={50}
        />
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
  }: // interactiveFiltersConfig,
  {
    features: GeoData;
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: MapFields;
    // interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <MapChart
        data={observations}
        features={features}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        // interactiveFiltersConfig={interactiveFiltersConfig}
      >
        <ChartContainer>
          <MapComponent />
        </ChartContainer>
      </MapChart>
    );
  }
);
