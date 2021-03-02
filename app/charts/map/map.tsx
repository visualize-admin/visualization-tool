import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { color, scaleQuantize } from "d3";
import { useChartState } from "../shared/use-chart-state";
import { MapState } from "./map-state";
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

export const MapComponent = () => {
  const { bounds, data, features } = useChartState() as MapState;

  const getColor = (v: number | undefined) => {
    const colorScale = scaleQuantize<number, $FixMe>()
      .domain([0, 1000000])
      .range(["#FFdddd", "#FFaaaa", "#FF5555"] as $FixMe[]);
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
          // getFillColor={() => [0, 0, 0, 20]}
          getRadius={100}
          getLineWidth={1}
        />
      </DeckGL>
    </div>
  );
};
