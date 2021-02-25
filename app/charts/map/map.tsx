import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useEffect, useState } from "react";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Error, Loading } from "../../components/hint";

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
      // municipalityMesh: GeoJSON.MultiLineString;
      // cantonMesh: GeoJSON.MultiLineString;
      // lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
    };

export const MapComponent = () => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();

        const municipalities = topojsonFeature(
          topo,
          topo.objects.municipalities
        );

        setGeoData({
          state: "loaded",
          municipalities,
        });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };
    load();
  }, []);
  return (
    <div>
      MAP!
      {geoData.state === "fetching" ? (
        <Loading />
      ) : geoData.state === "error" ? (
        <Error>No geo data was found!</Error>
      ) : (
        <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true}>
          <GeoJsonLayer
            id="municipalities"
            data={geoData.municipalities}
            pickable={true}
            stroked={false}
            filled={true}
            extruded={false}
            autoHighlight={true}
            // getFillColor={(d: $FixMe) => {
            //   const obs = observationsByMunicipalityId.get(d.id.toString());
            //   return obs
            //     ? getColor(mean(obs, (d) => d.value))
            //     : [0, 0, 0, 20];
            // }}
            highlightColor={[0, 0, 0, 50]}
            getRadius={100}
            getLineWidth={1}
          />
        </DeckGL>
      )}
    </div>
  );
};
