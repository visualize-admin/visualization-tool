import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { scaleThreshold, schemePurples, color, scaleQuantize } from "d3";
import { useEffect, useState } from "react";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Error, Loading } from "../../components/hint";
// import data from "/one-person-households.json"
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 2,
  maxZoom: 16,
  minZoom: 2,
  pitch: 0,
  bearing: 0,
};
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

export const MapComponent = () => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [data, setData] = useState<DataState>({ state: "fetching" });
  console.log(data);

  // const observationsByMunicipalityId = useMemo(() => {
  //   return group(observations, (d) => d.municipality);
  // }, [observations]);

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

  const getColor = (v: number | undefined) => {
    const colorScale = scaleQuantize<number, string>()
      .domain([0, 1000000])
      .range(["pink", "hotpink", "red"]);
    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    console.log({ c });
    const rgb = c && color(c)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  return (
    <div>
      MAP!
      {geoData.state === "fetching" || data.state === "fetching" ? (
        <Loading />
      ) : geoData.state === "error" ? (
        <Error>No geo data was found!</Error>
      ) : (
        data.state === "loaded" &&
        data.ds && (
          <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true}>
            <GeoJsonLayer
              id="municipalities"
              data={geoData.cantons}
              pickable={true}
              stroked={true}
              filled={true}
              extruded={false}
              autoHighlight={true}
              getFillColor={(d: $FixMe) => {
                const obs = data.ds.find((x) => x.Id === d.id);
                console.log(obs);
                console.log("vlaue", obs["Holzernte...Total"]);
                console.log(getColor(obs["Holzernte...Total"]));
                return obs
                  ? getColor(+obs["Holzernte...Total"])
                  : [0, 0, 0, 20];
              }}
              highlightColor={[0, 0, 0, 50]}
              // getFillColor={() => [0, 0, 0, 20]}
              getRadius={100}
              getLineWidth={1}
            />
          </DeckGL>
        )
      )}
    </div>
  );
};
