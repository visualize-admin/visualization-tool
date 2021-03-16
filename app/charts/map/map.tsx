import { HoverObject, MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { FillStyleExtension } from "@deck.gl/extensions";

import { TileLayer, MVTLayer } from "@deck.gl/geo-layers";
import DeckGL from "@deck.gl/react";
import { useCallback, useState } from "react";
import { Box, Button } from "theme-ui";
import { Observation } from "../../domain/data";
import { Icon, IconName } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { MapState } from "./map-state";

type TileData = {
  z: number;
  x: number;
  y: number;
  url: string;
  bbox: { west: number; north: number; east: number; south: number };
  signal: { aborted: boolean };
};
const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 5,
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
  const [, dispatch] = useInteraction();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(({ viewState, interactionState }) => {
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
  const zoomIn = () => {
    const newViewState = {
      ...viewState,
      zoom: Math.min(viewState.zoom + 1, viewState.maxZoom),
    };
    setViewState(constrainZoom(newViewState, CH_BBOX));
  };
  const zoomOut = () => {
    const newViewState = {
      ...viewState,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
    };
    setViewState(constrainZoom(newViewState, CH_BBOX));
  };

  return (
    <Box>
      <Box
        sx={{
          zIndex: 13,
          position: "absolute",
          bottom: 0,
          right: 0,
          mb: 3,
          mr: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ZoomButton label="+" iconName="add" handleClick={zoomIn} />
        <ZoomButton label="-" iconName="minus" handleClick={zoomOut} />
      </Box>
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        onResize={onResize}
        controller={{ type: MapController }}
      >
        {/* <TileLayer
          getTileData={({ z, x, y }: TileData) =>
            `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.leichte-basiskarte_reliefschattierung/default/current/3857/${z}/${x}/${y}.png`
          }
          pickable={true}
          highlightColor={[60, 60, 60, 40]}
          minZoom={2}
          maxZoom={16}
          tileSize={256}
          renderSubLayers={(props: { tile: TileData; data: $FixMe }) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;
            return [
              new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north],
              }),
            ];
          }}
        /> */}
        {/* <MVTLayer
          data="https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v1.0.0/{z}/{x}/{y}.pbf"
          getLineColor={[192, 192, 192]}
          getFillColor={[140, 170, 180, 0.1]}
          lineWidthMinPixels={1}
        /> */}
        <GeoJsonLayer
          id="cantons"
          data={features.cantons}
          pickable={true}
          stroked={true}
          filled={true}
          extruded={false}
          autoHighlight={true}
          getFillColor={(d: $FixMe) => {
            const obs = data.find((x: Observation) => x.id === d.id);
            return obs && !isNaN(getValue(obs))
              ? getColor(getValue(obs))
              : [204, 204, 204, 100];
          }}
          onHover={({ x, y, object }: HoverObject) => {
            if (object && object.id) {
              dispatch({
                type: "INTERACTION_UPDATE",
                value: {
                  interaction: {
                    visible: true,
                    mouse: { x, y },
                    d: data.find((x: Observation) => x.id === object.id),
                  },
                },
              });
            } else {
              dispatch({
                type: "INTERACTION_HIDE",
              });
            }
          }}
          extensions={[new FillStyleExtension({ pattern: true })]}
          highlightColor={[0, 0, 0, 50]}
          getRadius={100}
          getLineWidth={1}
          updateTriggers={{ getFillColor: getColor, getFillPattern: data }}
          fillPatternMask={true}
          fillPatternAtlas="/static/sprite/sprite.png"
          fillPatternMapping="/static/sprite/pattern.json"
          getFillPattern={(d: $FixMe) => {
            const obs = data.find((x: Observation) => x.id === d.id);
            return obs && isNaN(getValue(obs)) ? "hatch" : "fill";
          }}
          getFillPatternScale={150}
          getFillPatternOffset={[0, 0]}
        />
        <GeoJsonLayer
          id="cantons-mesh"
          data={features.cantonMesh}
          pickable={false}
          stroked={true}
          filled={false}
          extruded={false}
          lineWidthMinPixels={1.2}
          lineWidthMaxPixels={3.6}
          getLineWidth={200}
          lineMiterLimit={1}
          getLineColor={[255, 255, 255]}
        />
        <GeoJsonLayer
          id="lakes"
          data={features.lakes}
          pickable={false}
          stroked={true}
          filled={true}
          extruded={false}
          lineWidthMinPixels={0.5}
          lineWidthMaxPixels={1}
          getLineWidth={100}
          getFillColor={[102, 175, 233]}
          getLineColor={[255, 255, 255]}
        />
      </DeckGL>
    </Box>
  );
};

const ZoomButton = ({
  label,
  iconName,
  handleClick,
}: {
  label: string;
  iconName: IconName;
  handleClick: () => void;
}) => (
  <Button
    variant="reset"
    sx={{
      width: 32,
      height: 32,
      borderRadius: "default",
      border: "1px solid",
      borderColor: "monochrome500",
      color: "monochrome700",
      bg: "monochrome100",
      padding: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "&:first-of-type": {
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottom: 0,
      },
      "&:last-of-type": {
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
      },
    }}
    onClick={handleClick}
  >
    <Icon name={iconName} size={24} />
  </Button>
);
