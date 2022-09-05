import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers/typed";
import { Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { geoArea } from "d3";
import { debounce, orderBy } from "lodash";
import maplibregl from "maplibre-gl";
import React from "react";
import Map, { LngLatLike, MapboxEvent, MapRef } from "react-map-gl";

import { useChartState } from "@/charts/shared/use-chart-state";
import { BBox } from "@/configurator";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";

import "maplibre-gl/dist/maplibre-gl.css";

import { DEFAULT_COLOR, FLY_TO_DURATION, RESET_DURATION } from "./constants";
import { useMapStyle } from "./get-base-layer-style";
import { DeckGLOverlay, useOnHover, useViewState } from "./helpers";
import { MapState } from "./map-state";
import { setMap } from "./ref";

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

// Debounced function fixes the problem of maximizing window or opening a console,
// when map was not resized initially.
const resize = debounce((e: MapboxEvent, bbox: BBox) => {
  if (e.originalEvent) {
    e.target.resize();
    e.target.fitBounds(bbox, { duration: 0 });
  }
}, 0);

export const MapComponent = () => {
  const classes = useStyles();
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

  const { defaultViewState, viewState, onViewStateChange } = useViewState({
    width,
    height,
    lockedBBox,
    featuresBBox,
  });

  const mapNodeRef = React.useRef<MapRef | null>(null);
  const handleMapNodeRef = (ref: MapRef) => {
    if (!ref) {
      return;
    }

    mapNodeRef.current = ref;
  };

  const currentBBox = React.useRef<BBox>();

  const lockedRef = React.useRef(locked);
  React.useEffect(() => {
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
  React.useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultViewState]);

  const zoomIn = useEvent(() => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.min(viewState.zoom + 1, viewState.maxZoom),
      duration: FLY_TO_DURATION,
    };
    mapNodeRef.current?.flyTo(newViewState);
  });

  const zoomOut = useEvent(() => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
      duration: FLY_TO_DURATION,
    };
    mapNodeRef.current?.flyTo(newViewState);
  });

  const mapStyle = useMapStyle({
    locale,
    showBaseLayer,
    showLabels: !areaLayer.show,
  });

  const onHover = useOnHover();

  const geoJsonLayer = React.useMemo(() => {
    if (!areaLayer.show) {
      return;
    }

    const getFillColor = (d: GeoFeature) => {
      const { observation } = d.properties;

      if (observation) {
        const value = areaLayer.getValue(observation);

        if (value !== null) {
          return areaLayer.getColor(value);
        }
      }

      return DEFAULT_COLOR;
    };

    // Sort for smaller shapes to be over larger ones, to be able to use tooltip
    const sortedFeatures = orderBy(
      features.areaLayer?.shapes?.features,
      geoArea,
      "desc"
    );
    const sortedShapes = {
      ...features.areaLayer?.shapes,
      features: sortedFeatures,
    };

    return new GeoJsonLayer({
      id: "areaLayer",
      // @ts-ignore - FIXME: properly type data & getFillColor fields
      data: sortedShapes,
      pickable: true,
      autoHighlight: true,
      extruded: false,
      filled: true,
      stroked: false,
      // @ts-ignore
      getFillColor,
      onHover: ({
        x,
        y,
        object,
      }: {
        x: number;
        y: number;
        object?: GeoFeature;
      }) => onHover({ type: "area", x, y, object }),
    });
  }, [areaLayer, features.areaLayer?.shapes, onHover]);

  const scatterplotLayer = React.useMemo(() => {
    if (!symbolLayer.show) {
      return;
    }

    const getFillColor = ({ properties: { observation } }: GeoPoint) => {
      if (observation) {
        return symbolLayer.colors.getColor(observation);
      }

      return DEFAULT_COLOR;
    };

    const getPosition = ({ coordinates }: GeoPoint) => {
      return coordinates;
    };

    const getRadius = ({ properties: { observation } }: GeoPoint) => {
      const value = observation ? symbolLayer.getValue(observation) : null;
      const radius = value ? symbolLayer.radiusScale(value) : 0;

      return radius;
    };
    const [radiusMinPixels, radiusMaxPixels] = symbolLayer.radiusScale.range();

    const data = features.symbolLayer?.points;
    const sortedData = data ? orderBy(data, getRadius, "desc") : [];

    return new ScatterplotLayer({
      id: "symbolLayer",
      pickable: identicalLayerComponentIris ? !areaLayer.show : true,
      autoHighlight: true,
      filled: true,
      stroked: false,
      data: sortedData,
      getPosition,
      getRadius,
      radiusUnits: "pixels",
      radiusMinPixels,
      radiusMaxPixels,
      // @ts-ignore
      getFillColor,
      onHover: ({
        x,
        y,
        object,
      }: {
        x: number;
        y: number;
        object?: GeoFeature;
      }) => onHover({ type: "symbol", x, y, object }),
    });
  }, [
    areaLayer.show,
    features.symbolLayer,
    identicalLayerComponentIris,
    onHover,
    symbolLayer,
  ]);

  const dataLoaded = features.areaLayer || features.symbolLayer;

  return (
    <>
      {locked ? null : (
        <div className={classes.controlButtons}>
          <ControlButton iconName="refresh" onClick={reset} />
          <ControlButton iconName="add" onClick={zoomIn} />
          <ControlButton iconName="minus" onClick={zoomOut} />
        </div>
      )}

      {dataLoaded ? (
        <Map
          ref={handleMapNodeRef}
          initialViewState={defaultViewState}
          mapLib={maplibregl}
          mapStyle={mapStyle}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
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
            const bbox = e.target.getBounds().toArray() as BBox;
            currentBBox.current = bbox;
            resize(e, lockedBBox || bbox);
          }}
          {...viewState}
        >
          <DeckGLOverlay layers={[geoJsonLayer, scatterplotLayer]} />
        </Map>
      ) : null}
    </>
  );
};

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
