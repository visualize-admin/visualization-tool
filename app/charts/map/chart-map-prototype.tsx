import React, { memo, useEffect, useState } from "react";
import { Box } from "theme-ui";
import { feature as topojsonFeature } from "topojson-client";
import { Select } from "../../components/form";
import { LoadingOverlay, NoDataHint } from "../../components/hint";
import { MapFields } from "../../configurator";
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
export const ChartMapVisualization = () => {
  const locale = useLocale();
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [data, setData] = useState<DataState>({ state: "fetching" });
  const [palette, setPalette] = useState("oranges");
  console.log("geoData", geoData);
  console.log("data", data);

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

        setData({
          state: "loaded",
          ds,
        });
      } catch (e) {
        setData({ state: "error" });
      }
    };
    loadData();
  }, []);

  if (geoData.state === "fetching" || data.state === "fetching") {
    return <LoadingOverlay />;
  } else if (geoData.state === "error" || data.state === "error") {
    return <NoDataHint />;
  } else {
    const dimensions = Object.keys(data.ds[0]).map((d) => ({
      __typename: "NominalDimension",
      iri: d,
      label: d,
    })) as ComponentFieldsFragment[];
    const measures = Object.keys(data.ds[0]).map((d) => ({
      __typename: "Measure",
      iri: d,
      label: d,
    })) as ComponentFieldsFragment[];

    return (
      <>
        <Box sx={{ bg: "monochrome100" }}>MAP!! 🤩🤩🤩🤩 xoxo</Box>
        <Box sx={{ m: 4, border: "1px solid hotpink", bg: "#FFFFFF" }}>
          <ChartMap
            observations={data.ds}
            features={geoData.cantons}
            fields={{
              x: { componentIri: "a" },
              y: { componentIri: "b", palette },
              segment: { componentIri: "c" },
            }}
            dimensions={dimensions}
            measures={measures}
          />
        </Box>
        <Box sx={{ bg: "monochrome100" }}>
          <Select
            label={"palette"}
            id={"palette"}
            name={"palette"}
            value={palette}
            disabled={false}
            options={[
              { value: "oranges", label: "oranges" },
              { value: "reds", label: "reds" },
            ]}
            onChange={(e) => setPalette(e.currentTarget.value)}
          ></Select>
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
