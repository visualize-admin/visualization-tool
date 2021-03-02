import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { color, scaleQuantize } from "d3";
import { useChartState } from "../shared/use-chart-state";
import { MapState } from "./map-state";
// import data from "/one-person-households.json"
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 7,
  maxZoom: 16,
  minZoom: 2,
  pitch: 0,
  bearing: 0,
};

export const MapComponent = () => {
  const { bounds, data, features, getColor } = useChartState() as MapState;

  return (
    <div>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <GeoJsonLayer
          id="municipalities"
          data={features}
          pickable={true}
          stroked={true}
          filled={true}
          extruded={false}
          autoHighlight={true}
          getFillColor={(d: $FixMe) => {
            const obs = data.find((x: $FixMe) => x.Id === d.id);
            return obs ? getColor(+obs["Holzernte...Total"]) : [0, 0, 0, 20];
          }}
          highlightColor={[0, 0, 0, 50]}
          getRadius={100}
          getLineWidth={1}
          updateTriggers={{ getFillColor: getColor }}
        />
      </DeckGL>
    </div>
  );
};
