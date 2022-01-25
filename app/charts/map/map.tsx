import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import React, { useCallback, useMemo, useState } from "react";
import { Box, Button } from "theme-ui";
import { GeoFeature, GeoPoint } from "../../domain/data";
import { Icon, IconName } from "../../icons";
import { convertHexToRgbArray } from "../shared/colors";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { MapState } from "./map-state";
import { useMapTooltip } from "./map-tooltip";

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
    showRelief,
    showLakes,
    features,
    identicalLayerComponentIris,
    areaLayer,
    symbolLayer,
  } = useChartState() as MapState;
  const [, dispatchInteraction] = useInteraction();
  const [, setMapTooltipType] = useMapTooltip();

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

  const symbolColorRgbArray = useMemo(
    () => convertHexToRgbArray(symbolLayer.color),
    [symbolLayer.color]
  );

  const shapes = useMemo(
    () => ({
      ...features.areaLayer?.shapes,
      features: features.areaLayer?.shapes?.features.filter(
        ({ properties: { hierarchyLevel } }: GeoFeature) =>
          hierarchyLevel === areaLayer.hierarchyLevel
      ),
    }),
    [areaLayer.hierarchyLevel, features.areaLayer?.shapes]
  );

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
        <ZoomButton iconName="add" handleClick={zoomIn} />
        <ZoomButton iconName="minus" handleClick={zoomOut} />
      </Box>
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        onResize={onResize}
        controller={{ type: MapController }}
        getCursor={() => "default"}
      >
        {showRelief && (
          <TileLayer
            getTileData={({ z, x, y }: TileData) =>
              `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.leichte-basiskarte_reliefschattierung/default/current/3857/${z}/${x}/${y}.png`
            }
            pickable={false}
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
          />
        )}

        {areaLayer.show && (
          <>
            <GeoJsonLayer
              id="shapes"
              data={shapes}
              pickable={true}
              autoHighlight={true}
              stroked={false}
              filled={true}
              extruded={false}
              onHover={({
                x,
                y,
                object,
              }: {
                x: number;
                y: number;
                object: GeoFeature;
              }) => {
                if (object) {
                  setMapTooltipType("area");
                  dispatchInteraction({
                    type: "INTERACTION_UPDATE",
                    value: {
                      interaction: {
                        visible: true,
                        mouse: { x, y },
                        d: object.properties.observation,
                      },
                    },
                  });
                } else {
                  dispatchInteraction({
                    type: "INTERACTION_HIDE",
                  });
                }
              }}
              updateTriggers={{
                getFillColor: [areaLayer.getValue, areaLayer.getColor],
              }}
              getFillColor={(d: GeoFeature) =>
                d.properties.observation
                  ? areaLayer.getColor(
                      areaLayer.getValue(d.properties.observation)
                    )
                  : null
              }
            />
            <GeoJsonLayer
              id="shapes-mesh"
              data={features.areaLayer?.mesh}
              pickable={false}
              stroked={true}
              filled={false}
              extruded={false}
              lineWidthMinPixels={1}
              lineWidthMaxPixels={2}
              getLineWidth={100}
              lineMiterLimit={1}
              getLineColor={[255, 255, 255]}
            />
          </>
        )}

        {showLakes && (
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
        )}

        {symbolLayer.show && (
          <ScatterplotLayer
            id="symbols"
            data={features.symbolLayer?.points}
            pickable={identicalLayerComponentIris ? !areaLayer.show : true}
            autoHighlight={true}
            opacity={0.7}
            stroked={false}
            filled={true}
            radiusUnits={"pixels"}
            radiusMinPixels={symbolLayer.radiusScale.range()[0]}
            radiusMaxPixels={symbolLayer.radiusScale.range()[1]}
            lineWidthMinPixels={1}
            getPosition={({ coordinates }: GeoPoint) => coordinates}
            getRadius={({ properties: { observation } }: GeoPoint) =>
              observation
                ? symbolLayer.radiusScale(
                    symbolLayer.getValue(observation) as number
                  )
                : 0
            }
            getFillColor={symbolColorRgbArray}
            getLineColor={[255, 255, 255]}
            onHover={({
              x,
              y,
              object,
            }: {
              x: number;
              y: number;
              object: GeoPoint;
            }) => {
              if (object) {
                setMapTooltipType("symbol");
                dispatchInteraction({
                  type: "INTERACTION_UPDATE",
                  value: {
                    interaction: {
                      visible: true,
                      mouse: { x, y },
                      d: object.properties.observation,
                    },
                  },
                });
              } else {
                dispatchInteraction({
                  type: "INTERACTION_HIDE",
                });
              }
            }}
            updateTriggers={{
              getRadius: [
                symbolLayer.data,
                symbolLayer.getValue,
                symbolLayer.radiusScale,
              ],
            }}
          />
        )}
      </DeckGL>
    </Box>
  );
};

const ZoomButton = ({
  iconName,
  handleClick,
}: {
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
