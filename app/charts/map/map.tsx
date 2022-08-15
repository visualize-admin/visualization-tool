import { WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import { Box, Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { geoArea } from "d3";
import { orderBy } from "lodash";
import maplibregl from "maplibre-gl";
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import ReactMap, { LngLatLike, MapRef, ViewState } from "react-map-gl";

import {
  emptyStyle,
  getBaseLayerStyle,
} from "@/charts/map/get-base-layer-style";
import { MapState } from "@/charts/map/map-state";
import { useMapTooltip } from "@/charts/map/map-tooltip";
import { convertHexToRgbArray } from "@/charts/shared/colors";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Bounds } from "@/charts/shared/use-width";
import { BBox } from "@/configurator/config-types";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";

import "maplibre-gl/dist/maplibre-gl.css";

import Layer from "./layer";
import { setMap } from "./ref";

type MinMaxZoomViewState = Pick<
  ViewState,
  "zoom" | "latitude" | "longitude"
> & {
  minZoom: number;
  maxZoom: number;
  width: number;
  height: number;
};

const BASE_VIEW_STATE: MinMaxZoomViewState = {
  minZoom: 1,
  maxZoom: 13,
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 5,
  width: 400,
  height: 400,
};

const getInitialViewState = (bbox: BBox | undefined, chartBounds: Bounds) => {
  if (bbox) {
    const { width, height } = chartBounds;
    const vp = new WebMercatorViewport({ ...BASE_VIEW_STATE, width, height });
    const bounds = vp.fitBounds(bbox);
    const viewState = { ...BASE_VIEW_STATE, ...bounds };

    return viewState;
  }

  return BASE_VIEW_STATE;
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
  viewState: MinMaxZoomViewState,
  bbox: BBox,
  { padding = 0 }: { padding?: number } = {}
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
      zoom: Math.min(viewState.maxZoom, Math.max(zoom, fitted.zoom)),
      longitude: p[0],
      latitude: p[1],
    };
  } else {
    return viewState;
  }
};

let globalGeoJsonLayerId = 0;
let globalScatterplotLayerId = 0;

export const MapComponent = () => {
  const {
    showBaseLayer,
    controlsType,
    features,
    identicalLayerComponentIris,
    areaLayer,
    symbolLayer,
    bounds,
    bbox,
  } = useChartState() as MapState;
  const initialViewStateRef = useRef<MinMaxZoomViewState | null>(null);
  const isViewStateLocked = controlsType === "locked";
  const initialViewState = useMemo(() => {
    return !isViewStateLocked
      ? BASE_VIEW_STATE
      : getInitialViewState(bbox, bounds);
  }, [isViewStateLocked, bbox, bounds]);
  const locale = useLocale();

  const [, dispatchInteraction] = useInteraction();
  const [, setMapTooltipType] = useMapTooltip();

  const [viewState, setViewState] = useState(initialViewState);
  const onViewStateChange = useCallback(
    ({ viewState }: { viewState: ViewState }) => {
      setViewState((oldVs) => ({ ...oldVs, ...viewState }));
    },
    []
  );

  const currentBBox = useRef<BBox>();
  const hasSetInitialZoom = useRef<boolean>();

  useEffect(() => {
    if (hasSetInitialZoom.current) {
      return;
    }

    let newViewState: MinMaxZoomViewState | undefined = undefined;

    if (bbox) {
      if (!isViewStateLocked) {
        newViewState = constrainZoom(viewState, bbox);
      } else {
        newViewState = viewState;
      }
    }

    if (newViewState) {
      initialViewStateRef.current = newViewState;
      setViewState(newViewState);
    }

    hasSetInitialZoom.current = true;
  }, [viewState, isViewStateLocked, bbox]);

  const mapNodeRef = useRef<MapRef | null>(null);
  const handleRefNode = (mapRef: MapRef) => {
    if (!mapRef) {
      return;
    }
    mapNodeRef.current = mapRef;
  };

  const refresh = () => {
    if (initialViewStateRef.current) {
      const { longitude, latitude, zoom } = initialViewStateRef.current;
      const newViewState = {
        center: [longitude, latitude] as LngLatLike,
        zoom,
        duration: 500,
      };
      mapNodeRef.current?.flyTo(newViewState);
    }
  };

  const zoomIn = () => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.min(viewState.zoom + 1, viewState.maxZoom),
      duration: 500,
    };
    mapNodeRef.current?.flyTo(newViewState);
  };

  const zoomOut = () => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
      duration: 500,
    };
    mapNodeRef.current?.flyTo(newViewState);
  };

  const symbolColorRgbArray = useMemo(
    () => convertHexToRgbArray(symbolLayer.color),
    [symbolLayer.color]
  );

  const baseLayerStyle = useMemo(
    () =>
      getBaseLayerStyle({
        locale,
        showLabels: !areaLayer.show,
      }),
    [locale, areaLayer.show]
  );
  const mapStyle = showBaseLayer ? baseLayerStyle : emptyStyle;

  const featuresLoaded =
    features.areaLayer !== undefined || features.symbolLayer !== undefined;

  const geoJsonLayerId = useMemo(() => {
    return globalGeoJsonLayerId++;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    areaLayer.getValue,
    areaLayer.hierarchyLevel,
    areaLayer.getColor,
    mapStyle,
  ]);
  const geoJsonLayer = useMemo(() => {
    if (!areaLayer.show) {
      return;
    }
    // Sort for smaller shapes to be over larger ones, to be able to use tooltip
    const sortedFeatures = orderBy(
      features.areaLayer?.shapes?.features.filter(
        ({ properties: { hierarchyLevel } }: GeoFeature) =>
          hierarchyLevel === areaLayer.hierarchyLevel
      ),
      geoArea,
      "asc"
    );
    const shapes = {
      ...features.areaLayer?.shapes,
      features: sortedFeatures,
    };
    const geoJsonLayer = new MapboxLayer({
      type: GeoJsonLayer,
      id: "shapes" + geoJsonLayerId,
      data: shapes,
      pickable: true,
      autoHighlight: true,
      stroked: false,
      filled: true,
      extruded: false,
      onHover: ({
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
      },
      getFillColor: (d: GeoFeature) => {
        const { observation } = d.properties;

        if (observation) {
          const value = areaLayer.getValue(observation);

          if (value !== null) {
            return areaLayer.getColor(value);
          }
        }

        return [222, 222, 222, 255];
      },
    });
    return geoJsonLayer;
  }, [
    areaLayer,
    dispatchInteraction,
    features.areaLayer?.shapes,
    setMapTooltipType,
    geoJsonLayerId,
  ]);

  const scatterplotLayerId = useMemo(() => {
    return globalScatterplotLayerId++;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    symbolLayer.data,
    symbolLayer.getValue,
    symbolLayer.radiusScale,
    mapStyle,
  ]);
  const scatterplotLayer = useMemo(() => {
    if (!symbolLayer.show) {
      return;
    }
    const getRadius = ({ properties: { observation } }: GeoPoint) =>
      observation
        ? symbolLayer.radiusScale(symbolLayer.getValue(observation) as number)
        : 0;
    // Sort for smaller points to be over larger ones, to be able to use tooltip
    const sortedPoints = features.symbolLayer?.points
      ? orderBy([...features.symbolLayer?.points], getRadius, "asc")
      : [];
    return new MapboxLayer({
      type: ScatterplotLayer,
      id: "scatterplot" + scatterplotLayerId,
      data: sortedPoints,
      pickable: identicalLayerComponentIris ? !areaLayer.show : true,
      autoHighlight: true,
      opacity: 0.7,
      stroked: false,
      filled: true,
      radiusUnits: "pixels",
      radiusMinPixels: symbolLayer.radiusScale.range()[0],
      radiusMaxPixels: symbolLayer.radiusScale.range()[1],
      lineWidthMinPixels: 1,
      getPosition: ({ coordinates }: GeoPoint) => coordinates,
      getRadius,
      getFillColor: symbolColorRgbArray,
      getLineColor: [255, 255, 255],
      onHover: ({
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
      },
    });
  }, [
    areaLayer.show,
    dispatchInteraction,
    features.symbolLayer?.points,
    identicalLayerComponentIris,
    scatterplotLayerId,
    setMapTooltipType,
    symbolColorRgbArray,
    symbolLayer,
  ]);

  return (
    <Box>
      {isViewStateLocked ? null : (
        <MapControlButtons
          refresh={refresh}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
        />
      )}

      {featuresLoaded && (
        <>
          <ReactMap
            /* @ts-ignore */
            mapStyle={mapStyle}
            mapLib={maplibregl}
            style={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            {...viewState}
            dragPan={!isViewStateLocked}
            onMove={(e) => {
              const userTriggered =
                e.originalEvent && e.originalEvent.type !== "resize";

              if (userTriggered) {
                currentBBox.current = e.target.getBounds().toArray() as BBox;
              }

              onViewStateChange(e);
            }}
            onResize={(e) => {
              if (currentBBox.current && isViewStateLocked) {
                e.target.fitBounds(currentBBox.current, { duration: 0 });
              }

              currentBBox.current = e.target.getBounds().toArray() as BBox;
            }}
            scrollZoom={!isViewStateLocked}
            doubleClickZoom={!isViewStateLocked}
            touchZoomRotate={!isViewStateLocked}
            ref={handleRefNode}
            onLoad={(e) => {
              setMap(e.target);
              currentBBox.current = e.target.getBounds().toArray() as BBox;
            }}
          >
            {areaLayer.show ? (
              <Layer
                key={geoJsonLayer.id}
                layer={geoJsonLayer}
                beforeId={mapStyle === emptyStyle ? undefined : "water_polygon"}
              />
            ) : null}
            {symbolLayer.show ? (
              <Layer key={scatterplotLayer.id} layer={scatterplotLayer} />
            ) : null}
          </ReactMap>
        </>
      )}
    </Box>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  mapControlButtons: {
    zIndex: 13,
    position: "absolute",
    bottom: 32,
    right: 16,
    display: "flex",
    flexDirection: "column",
  },
  mapControlButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
    minHeight: 0,
    width: 32,
    height: 32,
    border: "1px solid",
    borderColor: theme.palette.grey[500],
    borderBottom: 0,
    borderRadius: 0,
    color: theme.palette.grey[700],
    backgroundColor: theme.palette.grey[100],
    padding: 0,
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
    },
    "&:first-of-type": {
      borderTopRightRadius: 3,
      borderTopLeftRadius: 3,
    },
    "&:last-of-type": {
      borderBottomRightRadius: 3,
      borderBottomLeftRadius: 3,
    },
  },
}));

const MapControlButtons = ({
  refresh,
  zoomIn,
  zoomOut,
}: {
  refresh: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.mapControlButtons}>
      <MapControlButton iconName="refresh" handleClick={refresh} />
      <MapControlButton iconName="add" handleClick={zoomIn} />
      <MapControlButton iconName="minus" handleClick={zoomOut} />
    </Box>
  );
};

const MapControlButton = ({
  iconName,
  handleClick,
}: {
  iconName: IconName;
  handleClick: () => void;
}) => {
  const classes = useStyles();

  return (
    <Button
      className={classes.mapControlButton}
      variant="contained"
      onClick={handleClick}
    >
      <Icon name={iconName} size={24} />
    </Button>
  );
};
