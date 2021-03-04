import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { useCallback, useState } from "react";
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

type BBox = [[number, number], [number, number]];

const CH_BBOX: BBox = [
  [5.956800664952974, 45.81912371940225],
  [10.493446773955753, 47.80741209797084],
];

/**
 * Constrain the viewState to always _contain_ the supplied bbox.
 *
 * (Other implementations ensure that the bbox _covers_ the viewport)
 *
 * @param viewState deck.gl viewState
 * @param bbox Bounding box of the feature to be contained
 */
const constrainZoom = (
  viewState: $FixMe,
  bbox: BBox,
  { padding = 24 }: { padding?: number } = {}
) => {
  const vp = new WebMercatorViewport(viewState);

  const { width, height, zoom, longitude, latitude } = viewState;

  const [x, y] = vp.project([longitude, latitude]);
  const [x0, y1] = vp.project(bbox[0]);
  const [x1, y0] = vp.project(bbox[1]);

  const fitted = vp.fitBounds(bbox, { padding });

  const [cx, cy] = vp.project([fitted.longitude, fitted.latitude]);

  const h = height - padding * 2;
  const w = width - padding * 2;

  const h2 = h / 2;
  const w2 = w / 2;

  const y2 =
    y1 - y0 < h ? cy : y - h2 < y0 ? y0 + h2 : y + h2 > y1 ? y1 - h2 : y;
  const x2 =
    x1 - x0 < w ? cx : x - w2 < x0 ? x0 + w2 : x + w2 > x1 ? x1 - w2 : x;

  const p = vp.unproject([x2, y2]);

  return {
    ...viewState,
    transitionDuration: 0,
    transitionInterpolator: null,
    zoom: Math.max(zoom, fitted.zoom),
    longitude: p[0],
    latitude: p[1],
  };
};

export const MapComponent = () => {
  const {
    bounds,
    data,
    features,
    getColor,
    getValue,
  } = useChartState() as MapState;
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(({ viewState, interactionState }) => {
    // setHovered(undefined);

    if (interactionState.inTransition) {
      setViewState(viewState);
    } else {
      setViewState(constrainZoom(viewState, CH_BBOX));
    }
  }, []);

  const onResize = useCallback(
    ({ width, height }) => {
      setViewState((viewState) =>
        constrainZoom({ ...viewState, width, height }, CH_BBOX)
      );
    },
    [setViewState]
  );
  return (
    <Box
    // sx={{
    //   mt: bounds.margins.top,
    //   mr: bounds.margins.right,
    //   mb: bounds.margins.bottom,
    //   ml: bounds.margins.left,
    // }}
    >
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        onResize={onResize}
        // controller={true}
        controller={{ type: MapController }}
      >
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
