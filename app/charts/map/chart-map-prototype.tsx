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
import { useLocale } from "../../locales/use-locale";
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
  const locale = useLocale();
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [dataset, loadDataset] = useState<DataState>({ state: "fetching" });
  const [palette, setPalette] = useState("oranges");
  const [nbSteps, setNbSteps] = useState(5);
  const [paletteType, setPaletteType] = useState<PaletteType>("continuous");
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
        const res = await fetch(`/data/holzernte.json`);
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

  // useEffect(() => {
  //   const dimensions =

  // }, )

  if (geoData.state === "fetching" || dataset.state === "fetching") {
    return <LoadingOverlay />;
  } else if (geoData.state === "error" || dataset.state === "error") {
    return <NoDataHint />;
  } else {
    const dimensions = Object.keys(dataset.ds[0]).map((d) => ({
      __typename: "NominalDimension",
      iri: d,
      label: d,
    })) as ComponentFieldsFragment[];
    const measures = Object.keys(dataset.ds[0]).map((d) => ({
      __typename: "Measure",
      iri: d,
      label: d,
    })) as ComponentFieldsFragment[];

    return (
      <>
        <Box sx={{ bg: "monochrome100" }}></Box>
        <Box sx={{ m: 4, border: "1px solid hotpink", bg: "#FFFFFF" }}>
          <ChartMap
            observations={dataset.ds}
            features={geoData.cantons}
            fields={{
              x: { componentIri: "a" },
              y: { componentIri: "b", palette, nbSteps },
              segment: { componentIri: "c" },
            }}
            dimensions={dimensions}
            measures={measures}
          />
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
            onChange={(e) =>
              setPaletteType(e.currentTarget.value as PaletteType)
            }
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
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
              { value: "6", label: "6" },
              { value: "7", label: "7" },
              { value: "8", label: "8" },
              { value: "9", label: "9" },
              { value: "10", label: "10" },
              { value: "11", label: "11" },
              { value: "12", label: "12" },
            ]}
            onChange={(e) => setNbSteps(+e.currentTarget.value)}
          ></Select>

          <ColorRamp
            colorInterpolator={getColorInterpolator(palette)}
            nbSteps={512}
            height={50}
          />
        </Box>
      </>
    );
  }
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
