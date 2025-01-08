import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers/typed";
import { supported } from "@mapbox/mapbox-gl-supported";
import { Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { geoArea } from "d3-geo";
import debounce from "lodash/debounce";
import orderBy from "lodash/orderBy";
import maplibreglraw from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, { LngLatLike, MapboxEvent } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  DEFAULT_COLOR,
  FLY_TO_DURATION,
  RESET_DURATION,
} from "@/charts/map/constants";
import { useMapStyle } from "@/charts/map/get-base-layer-style";
import {
  BASE_VIEW_STATE,
  DeckGLOverlay,
  useViewState,
} from "@/charts/map/helpers";
import { MapState } from "@/charts/map/map-state";
import { HoverObjectType, useMapTooltip } from "@/charts/map/map-tooltip";
import { getMap, setMap } from "@/charts/map/ref";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { BBox } from "@/configurator";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

// supported was removed as of maplibre-gl v3.0.0, so we need to add it back
const maplibregl = { ...maplibreglraw, supported };

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
    borderColor: theme.palette.divider,
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
      borderBottomColor: theme.palette.divider,
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

  const [{ interaction }, dispatchInteraction] = useInteraction();
  const [, setMapTooltipType] = useMapTooltip();

  const {
    showBaseLayer,
    locked,
    features,
    identicalLayerComponentIds,
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
        essential: true,
      };
      getMap()?.flyTo(newViewState);
    }
  });

  // Reset the view when default view changes (new features appeared on the map).
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultViewState]);

  const zoomIn = useEvent(() => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.min(viewState.zoom + 1, BASE_VIEW_STATE.maxZoom),
      duration: FLY_TO_DURATION,
      essential: true,
    };
    getMap()?.flyTo(newViewState);
  });

  const zoomOut = useEvent(() => {
    const newViewState = {
      center: [viewState.longitude, viewState.latitude] as LngLatLike,
      zoom: Math.max(viewState.zoom - 1, BASE_VIEW_STATE.minZoom),
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

  const sortedShapes = useMemo(() => {
    // Sort for smaller shapes to be over larger ones, to be able to use tooltip
    const sortedFeatures = orderBy(
      features.areaLayer?.shapes?.features,
      geoArea,
      "desc"
    ) as GeoFeature[];

    return {
      ...features.areaLayer?.shapes,
      features: sortedFeatures,
    };
  }, [features.areaLayer?.shapes]);

  const geoJsonLayer = useMemo(() => {
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

    return new GeoJsonLayer({
      id: "areaLayer",
      beforeId: showBaseLayer ? "water_polygon" : undefined,
      data: sortedShapes,
      pickable: true,
      parameters: {
        /**
         * Fixes hover on overlapping layers
         * @see https://deck.gl/docs/developer-guide/tips-and-tricks#z-fighting-and-depth-testing
         */
        depthTest: false,
      },
      extruded: false,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 0.8,
      getLineColor: [255, 255, 255],
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
      updateTriggers: {
        getFillColor,
      },
    });
  }, [areaLayer?.colors, sortedShapes, onHover, showBaseLayer]);

  const hoverLayer = useMemo(() => {
    if (!interaction.visible || !sortedShapes || !areaLayer) {
      return;
    }

    const shape = sortedShapes.features.find(
      (d) => d.properties.observation === interaction.d
    );

    if (shape) {
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

      return new GeoJsonLayer({
        id: "hoverLayer",
        // @ts-ignore
        data: shape,
        filled: true,
        stroked: true,
        lineWidthMinPixels: 2,
        // @ts-ignore
        getFillColor,
      });
    }
  }, [areaLayer, interaction.d, interaction.visible, sortedShapes]);

  const scatterplotLayer = useMemo(() => {
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
      pickable: identicalLayerComponentIds ? !areaLayer : true,
      autoHighlight: true,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 0.8,
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
      updateTriggers: {
        getFillColor,
        getPosition,
        getRadius,
        onHover,
      },
    });
  }, [
    areaLayer,
    features.symbolLayer,
    identicalLayerComponentIds,
    onHover,
    symbolLayer,
  ]);

  const dataLoaded =
    features.areaLayer ??
    features.symbolLayer ??
    // Raw map without data layers.
    (areaLayer === undefined && symbolLayer === undefined);

  const redrawMap = useEvent(() => {
    const map = getMap();

    if (!map) {
      return;
    }

    const bbox = lockedBBox ?? (map.getBounds().toArray() as BBox);
    resizeAndFit(map, bbox);
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
        <div className={classes.controlButtons} {...DISABLE_SCREENSHOT_ATTR}>
          <ControlButton iconName="refresh" onClick={reset} />
          <ControlButton iconName="add" onClick={zoomIn} />
          <ControlButton iconName="minus" onClick={zoomOut} />
        </div>
      )}

      {dataLoaded && width > 1 && height > 1 ? (
        <Map
          initialViewState={defaultViewState}
          mapLib={maplibregl}
          mapStyle={mapStyle}
          // Important so we can take a screenshot of the map
          preserveDrawingBuffer
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
          onData={(e) => {
            if (e.dataType === "source" && !e.isSourceLoaded) {
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
            /**
             * Redraw the map on load, when style data has been downloaded
             * to solve an offset problem between the viz layer and the base layer
             * happening in Edge under precise conditions (Windows 10, Edge 105,
             * resolution 1440x900).
             */
            redrawMap();
          }}
          onMove={onViewStateChange}
          onResize={handleResize}
          {...viewState}
        >
          <div data-map-loaded={loaded ? "true" : "false"} />
          <DeckGLOverlay
            interleaved
            layers={[geoJsonLayer, hoverLayer, scatterplotLayer]}
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
