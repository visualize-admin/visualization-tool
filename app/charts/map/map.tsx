import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { Box } from "theme-ui";
import { useChartState } from "../shared/use-chart-state";
import { MapState } from "./map-state";

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
  const {
    bounds,
    data,
    features,
    getColor,
    getValue,
  } = useChartState() as MapState;

  return (
    <Box
    // sx={{
    //   mt: bounds.margins.top,
    //   mr: bounds.margins.right,
    //   mb: bounds.margins.bottom,
    //   ml: bounds.margins.left,
    // }}
    >
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
            const obs = data.find((x: $FixMe) => x.id === d.id);
            return obs ? getColor(getValue(obs)) : [0, 0, 0, 20];
          }}
          highlightColor={[0, 0, 0, 50]}
          getRadius={100}
          getLineWidth={1}
          updateTriggers={{ getFillColor: getColor }}
        />
      </DeckGL>
    </Box>
  );
};
