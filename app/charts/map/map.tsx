import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers/typed";
import { MapboxLayer } from "@deck.gl/mapbox/typed";
import { Box, Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { geoArea } from "d3";
import { orderBy } from "lodash";
import maplibregl from "maplibre-gl";
import React, { useEffect, useMemo, useRef } from "react";
import ReactMap, { LngLatLike, MapRef } from "react-map-gl";

import { emptyStyle, useMapStyle } from "@/charts/map/get-base-layer-style";
import { MapState } from "@/charts/map/map-state";
import { useChartState } from "@/charts/shared/use-chart-state";
import { BBox } from "@/configurator/config-types";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";

import "maplibre-gl/dist/maplibre-gl.css";

import { FLY_TO_DURATION, RESET_DURATION } from "./constants";
import { useOnHover, useViewState } from "./helpers";
import Layer from "./layer";
import { setMap } from "./ref";

let globalGeoJsonLayerId = 0;
let globalScatterplotLayerId = 0;

export const MapComponent = () => {
  const locale = useLocale();
  const {
    showBaseLayer,
    locked,
    features,
    identicalLayerComponentIris,
    areaLayer,
    symbolLayer,
    bounds: { width, height },
    lockedBBox,
    featuresBBox,
  } = useChartState() as MapState;
  const classes = useStyles();

  const { defaultViewState, viewState, onViewStateChange } = useViewState({
    width,
    height,
    lockedBBox,
    featuresBBox,
  });

  const mapNodeRef = useRef<MapRef | null>(null);
  const handleRefNode = (mapRef: MapRef) => {
    if (!mapRef) {
      return;
    }
    mapNodeRef.current = mapRef;
  };
  const currentBBox = useRef<BBox>();

  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  // Resets the map to its default state (showing all visible features).
  const reset = useEvent(() => {
    // Reset the map only when it's in an unlocked mode.
    if (!lockedRef.current) {
      const { longitude, latitude, zoom } = defaultViewState;
      const newViewState = {
        center: [longitude, latitude] as LngLatLike,
        zoom,
        duration: RESET_DURATION,
      };
      mapNodeRef.current?.flyTo(newViewState);
    }
  });

  // Reset the view when default view changes (new features appeared on the map).
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultViewState]);

  const zoomIn = () => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.min(viewState.zoom + 1, viewState.maxZoom),
      duration: FLY_TO_DURATION,
    };
    mapNodeRef.current?.flyTo(newViewState);
  };

  const zoomOut = () => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
      duration: FLY_TO_DURATION,
    };
    mapNodeRef.current?.flyTo(newViewState);
  };

  const mapStyle = useMapStyle({
    locale,
    showBaseLayer,
    showLabels: !areaLayer.show,
  });

  const onHover = useOnHover();

  const geoJsonLayerId = useMemo(() => {
    return globalGeoJsonLayerId++;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaLayer.getValue, areaLayer.getColor, mapStyle]);
  const geoJsonLayer = useMemo(() => {
    if (!areaLayer.show) {
      return;
    }
    // Sort for smaller shapes to be over larger ones, to be able to use tooltip
    const sortedFeatures = orderBy(
      features.areaLayer?.shapes?.features,
      geoArea,
      "desc"
    );
    const shapes = {
      ...features.areaLayer?.shapes,
      features: sortedFeatures,
    };
    const geoJsonLayer = new MapboxLayer<GeoJsonLayer>({
      type: GeoJsonLayer,
      id: "shapes" + geoJsonLayerId,
      // @ts-ignore - FIXME: properly type data & getFillColor fields
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
        object?: GeoFeature;
      }) => onHover({ type: "area", x, y, object }),
      // @ts-ignore
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
  }, [areaLayer, geoJsonLayerId, features.areaLayer?.shapes, onHover]);

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

    const getRadius = ({ properties: { observation } }: GeoPoint) => {
      const value = observation ? symbolLayer.getValue(observation) : null;
      const radius = value ? symbolLayer.radiusScale(value) : 0;
      return radius;
    };

    // Sort for smaller points to be over larger ones, to be able to use tooltip
    const sortedPoints = features.symbolLayer?.points
      ? orderBy([...features.symbolLayer?.points], getRadius, "desc")
      : [];
    return new MapboxLayer<ScatterplotLayer>({
      type: ScatterplotLayer,
      id: "scatterplot" + scatterplotLayerId,
      data: sortedPoints,
      pickable: identicalLayerComponentIris ? !areaLayer.show : true,
      autoHighlight: true,
      stroked: false,
      filled: true,
      radiusUnits: "pixels",
      radiusMinPixels: symbolLayer.radiusScale.range()[0],
      radiusMaxPixels: symbolLayer.radiusScale.range()[1],
      lineWidthMinPixels: 1,
      getPosition: ({ coordinates }: GeoPoint) => coordinates,
      getRadius,
      // @ts-ignore
      getFillColor: (d: GeoPoint) => {
        const { observation } = d.properties;
        if (observation) {
          return symbolLayer.colors.getColor(observation);
        }

        return [222, 222, 222, 255];
      },
      getLineColor: [255, 255, 255],
      onHover: ({
        x,
        y,
        object,
      }: {
        x: number;
        y: number;
        object?: GeoPoint;
      }) => onHover({ type: "symbol", x, y, object }),
    });
  }, [
    areaLayer.show,
    features.symbolLayer?.points,
    identicalLayerComponentIris,
    onHover,
    scatterplotLayerId,
    symbolLayer,
  ]);

  const featuresLoaded =
    features.areaLayer !== undefined || features.symbolLayer !== undefined;

  return (
    <Box>
      {locked ? null : (
        <div className={classes.controlButtons}>
          <ControlButton iconName="refresh" onClick={reset} />
          <ControlButton iconName="add" onClick={zoomIn} />
          <ControlButton iconName="minus" onClick={zoomOut} />
        </div>
      )}

      {featuresLoaded && (
        <>
          <ReactMap
            ref={handleRefNode}
            mapLib={maplibregl}
            /* @ts-ignore */
            mapStyle={mapStyle}
            style={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            dragPan={!locked}
            scrollZoom={!locked}
            doubleClickZoom={!locked}
            touchZoomRotate={!locked}
            onLoad={(e) => {
              setMap(e.target);
              currentBBox.current = e.target.getBounds().toArray() as BBox;
            }}
            onMove={(e) => {
              const userTriggered =
                e.originalEvent && e.originalEvent.type !== "resize";

              if (userTriggered) {
                currentBBox.current = e.target.getBounds().toArray() as BBox;
              }

              onViewStateChange(e);
            }}
            onResize={(e) => {
              if (currentBBox.current && locked) {
                e.target.fitBounds(currentBBox.current, { duration: 0 });
              }

              currentBBox.current = e.target.getBounds().toArray() as BBox;
            }}
            {...viewState}
          >
            {geoJsonLayer ? (
              <Layer
                key={geoJsonLayer.id}
                // @ts-ignore
                layer={geoJsonLayer}
                beforeId={mapStyle === emptyStyle ? undefined : "water_polygon"}
              />
            ) : null}
            {scatterplotLayer ? (
              // @ts-ignore
              <Layer key={scatterplotLayer.id} layer={scatterplotLayer} />
            ) : null}
          </ReactMap>
        </>
      )}
    </Box>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  controlButtons: {
    zIndex: 13,
    position: "absolute",
    bottom: 32,
    right: 16,
    display: "flex",
    flexDirection: "column",
  },
  controlButton: {
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
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.grey[500],
      borderBottomRightRadius: 3,
      borderBottomLeftRadius: 3,
    },
  },
}));

const ControlButton = ({
  iconName,
  onClick,
}: {
  iconName: IconName;
  onClick: () => void;
}) => {
  const classes = useStyles();

  return (
    <Button
      className={classes.controlButton}
      variant="contained"
      onClick={onClick}
    >
      <Icon name={iconName} size={24} />
    </Button>
  );
};
