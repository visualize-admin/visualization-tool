import { MapController, WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StaticMap } from "react-map-gl";
import { Box, Button } from "@mui/material";
import { GeoFeature, GeoPoint } from "../../domain/data";
import { Icon, IconName } from "../../icons";
import { useLocale } from "../../src";
import { convertHexToRgbArray } from "../shared/colors";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { getBaseLayerStyle } from "./get-base-layer-style";
import { BBox, getBBox } from "./helpers";
import { MapAttribution } from "./map-attribution";
import { MapState } from "./map-state";
import { useMapTooltip } from "./map-tooltip";

const MAX_ZOOM = 13;

const INITIAL_VIEW_STATE = {
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 5,
  minZoom: 1,
  maxZoom: MAX_ZOOM,
  pitch: 0,
  bearing: 0,
};

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

  // Make sure the map is rendered before trying to project & fitBounds
  if (vp.width > 1 && vp.height > 1) {
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
      zoom: Math.min(MAX_ZOOM, Math.max(zoom, fitted.zoom)),
      longitude: p[0],
      latitude: p[1],
    };
  } else {
    return viewState;
  }
};

export const MapComponent = () => {
  const {
    showBaseLayer,
    features,
    identicalLayerComponentIris,
    areaLayer,
    symbolLayer,
  } = useChartState() as MapState;
  const locale = useLocale();

  const [, dispatchInteraction] = useInteraction();
  const [, setMapTooltipType] = useMapTooltip();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(
    ({ viewState }) => setViewState(viewState),
    []
  );

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const hasSetInitialZoom = useRef<boolean>();

  const setInitialZoom = useCallback(() => {
    if (hasSetInitialZoom.current) {
      return;
    }

    const bbox = getBBox(
      areaLayer.show ? features.areaLayer?.shapes : undefined,
      symbolLayer.show ? features.symbolLayer?.points : undefined
    );
    if (bbox) {
      setViewState(constrainZoom(viewState, bbox, { padding: 48 }));
    }

    hasSetInitialZoom.current = true;
  }, [
    viewState,
    features.areaLayer?.shapes,
    features.symbolLayer?.points,
    areaLayer,
    symbolLayer,
  ]);

  useEffect(() => {
    if (!isMapLoaded) {
      return;
    }

    setInitialZoom();
  }, [isMapLoaded, setInitialZoom]);

  const onResize = useCallback(
    ({ width, height }) => {
      setViewState((viewState) => ({ ...viewState, width, height }));
    },
    [setViewState]
  );

  const zoomIn = () => {
    const newViewState = {
      ...viewState,
      zoom: Math.min(viewState.zoom + 1, viewState.maxZoom),
    };
    setViewState(newViewState);
  };

  const zoomOut = () => {
    const newViewState = {
      ...viewState,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
    };
    setViewState(newViewState);
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

  const baseLayerStyle = useMemo(() => getBaseLayerStyle({ locale }), [locale]);
  const featuresLoaded =
    features.areaLayer !== undefined || features.symbolLayer !== undefined;

  const deckRef = useRef<any>();
  const compactMapAttribution = deckRef.current?.deck.width < 600;

  return (
    <Box>
      <Box
        sx={{
          zIndex: 13,
          position: "absolute",
          bottom: 55,
          right: 15,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ZoomButton iconName="add" handleClick={zoomIn} />
        <ZoomButton iconName="minus" handleClick={zoomOut} />
      </Box>
      {featuresLoaded && (
        <>
          <DeckGL
            ref={deckRef}
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            onResize={onResize}
            onLoad={() => setIsMapLoaded(true)}
            controller={{ type: MapController }}
            getCursor={() => "default"}
          >
            {showBaseLayer && (
              <StaticMap mapStyle={baseLayerStyle} attributionControl={false} />
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
                  getFillColor={(d: GeoFeature) => {
                    const { observation } = d.properties;

                    if (observation) {
                      const value = areaLayer.getValue(observation);

                      if (value !== null) {
                        return areaLayer.getColor(value);
                      }
                    }

                    return [222, 222, 222, 255];
                  }}
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
          <MapAttribution compact={compactMapAttribution} />
        </>
      )}
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
    variant="text"
    sx={{
      width: 32,
      height: 32,
      borderRadius: 1,
      border: "1px solid",
      borderColor: "grey.500",
      color: "grey.700",
      backgroundColor: "grey.100",
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
