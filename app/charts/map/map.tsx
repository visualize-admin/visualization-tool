import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers/typed";
import { Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { easeCubic, geoArea } from "d3";
import debounce from "lodash/debounce";
import orderBy from "lodash/orderBy";
import maplibregl from "maplibre-gl";
import React, { useState } from "react";
import Map, { LngLatLike, MapboxEvent } from "react-map-gl";

import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { BBox } from "@/configurator";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";

import "maplibre-gl/dist/maplibre-gl.css";

import { DEFAULT_COLOR, FLY_TO_DURATION, RESET_DURATION } from "./constants";
import { useMapStyle } from "./get-base-layer-style";
import { DeckGLOverlay, useViewState } from "./helpers";
import { MapState } from "./map-state";
import { HoverObjectType, useMapTooltip } from "./map-tooltip";
import { getMap, setMap } from "./ref";

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
const resizeAndFit = debounce((map: mapboxgl.Map, bbox: BBox) => {
  map.resize();
  map.fitBounds(bbox, { duration: 0 });
}, 0);

export const MapComponent = () => {
  const classes = useStyles();
  const locale = useLocale();

  const [, dispatchInteraction] = useInteraction();
  const [, setMapTooltipType] = useMapTooltip();

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
        essential: true,
      };
      getMap()?.flyTo(newViewState);
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
      essential: true,
    };
    getMap()?.flyTo(newViewState);
  });

  const zoomOut = useEvent(() => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.max(viewState.zoom - 1, viewState.minZoom),
      duration: FLY_TO_DURATION,
      essential: true,
    };
    getMap()?.flyTo(newViewState);
  });

  const mapStyle = useMapStyle({
    locale,
    showBaseLayer,
    showLabels: !areaLayer,
  });

  const onHover = useEvent(
    ({
      type,
      x,
      y,
      object,
    }: {
      type: HoverObjectType;
      x: number;
      y: number;
      object?: GeoFeature | GeoPoint;
    }) => {
      if (object) {
        const { observation } = object.properties;

        setMapTooltipType(type);
        dispatchInteraction({
          type: "INTERACTION_UPDATE",
          value: {
            interaction: { visible: true, mouse: { x, y }, d: observation },
          },
        });
      } else {
        dispatchInteraction({
          type: "INTERACTION_HIDE",
        });
      }
    }
  );

  const geoJsonLayer = React.useMemo(() => {
    if (!areaLayer?.colors) {
      return;
    }

    const getFillColor = (d: GeoFeature) => {
      const { observation } = d.properties;

      if (observation) {
        const value = areaLayer.colors.getValue(observation);

        if (value !== null) {
          return areaLayer.colors.getColor(observation);
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
      beforeId: showBaseLayer ? "water_polygon" : undefined,
      // @ts-ignore - FIXME: properly type data & getFillColor fields
      data: sortedShapes,
      pickable: true,
      autoHighlight: true,
      parameters: {
        /**
         * Fixes hover on overlapping layers
         * @see https://deck.gl/docs/developer-guide/tips-and-tricks#z-fighting-and-depth-testing
         */
        depthTest: false,
      },
      extruded: false,
      filled: true,
      stroked: false,
      // @ts-ignore
      getFillColor,
      transitions: {
        getFillColor: {
          // FIXME: share with other transitions, especially in column chart
          duration: 750,
          easing: easeCubic,
        },
      },
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
  }, [areaLayer?.colors, features.areaLayer?.shapes, onHover, showBaseLayer]);

  const scatterplotLayer = React.useMemo(() => {
    if (!symbolLayer) {
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
      // @ts-ignore - value can be undefined, D3 types are wrong here
      const radius = symbolLayer.radiusScale(value) ?? 0;

      return radius;
    };
    const [radiusMinPixels, radiusMaxPixels] = symbolLayer.radiusScale.range();

    const data = features.symbolLayer?.points;
    const sortedData = data ? orderBy(data, getRadius, "desc") : [];

    return new ScatterplotLayer({
      id: "symbolLayer",
      pickable: identicalLayerComponentIris ? !areaLayer : true,
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
    areaLayer,
    features.symbolLayer,
    identicalLayerComponentIris,
    onHover,
    symbolLayer,
  ]);

  const dataLoaded =
    features.areaLayer ||
    features.symbolLayer ||
    // Raw map without data layers.
    (areaLayer === undefined && symbolLayer === undefined);

  const redrawMap = useEvent(() => {
    const map = getMap();

    if (!map) {
      return;
    }

    const bbox = map.getBounds().toArray() as BBox;
    currentBBox.current = bbox;
    resizeAndFit(map, lockedBBox || bbox);
  });

  const handleResize = useEvent((e: MapboxEvent) => {
    if (e.originalEvent) {
      redrawMap();
    }
  });

  const [loaded, setLoaded] = useState(false);
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
          dragRotate={false}
          touchZoomRotate={!locked}
          onData={(ev) => {
            if (ev.dataType === "source" && !ev.isSourceLoaded) {
              setLoaded(false);
            }
          }}
          onIdle={() => {
            setLoaded(true);
          }}
          onRemove={() => {
            setLoaded(false);
            setMap(null);
          }}
          onLoad={(e) => {
            setMap(e.target as mapboxgl.Map);
            currentBBox.current = e.target.getBounds().toArray() as BBox;

            /**
             * Redraw the map on load, when style data has been downloaded
             * to solve an offset problem between the viz layer and the base layer
             * happening in Edge under precise conditions (Windows 10, Edge 105,
             * resolution 1440x900).
             */
            redrawMap();
          }}
          onMove={(e) => {
            const userTriggered =
              e.originalEvent && e.originalEvent.type !== "resize";

            if (userTriggered) {
              currentBBox.current = e.target.getBounds().toArray() as BBox;
            }

            onViewStateChange(e);
          }}
          onResize={handleResize}
          {...viewState}
        >
          <div data-map-loaded={loaded ? "true" : "false"} />
          <DeckGLOverlay
            interleaved
            layers={[geoJsonLayer, scatterplotLayer]}
          />
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
