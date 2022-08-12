import { WebMercatorViewport } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import { Box, Button } from "@mui/material";
import { geoArea } from "d3";
import { orderBy } from "lodash";
import maplibregl, { LngLatLike } from "maplibre-gl";
import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import ReactMap, { MapRef, ViewState } from "react-map-gl";

import {
  emptyStyle,
  getBaseLayerStyle,
} from "@/charts/map/get-base-layer-style";
import { BBox, getBBox } from "@/charts/map/helpers";
import { MapState } from "@/charts/map/map-state";
import { useMapTooltip } from "@/charts/map/map-tooltip";
import { convertHexToRgbArray } from "@/charts/shared/colors";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { GeoFeature, GeoPoint } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";

import "maplibre-gl/dist/maplibre-gl.css";
import Layer from "./layer";

type MinMaxZoomViewState = Pick<
  ViewState,
  "zoom" | "latitude" | "longitude"
> & {
  minZoom: number;
  maxZoom: number;
  width: number;
  height: number;
};

const INITIAL_VIEW_STATE: MinMaxZoomViewState = {
  minZoom: 1,
  maxZoom: 13,
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 5,
  width: 400,
  height: 400,
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
    ({ viewState }: { viewState: ViewState }) =>
      setViewState((oldVs) => ({ ...oldVs, ...viewState })),
    []
  );

  const hasSetInitialZoom = useRef<boolean>();

  useEffect(() => {
    if (hasSetInitialZoom.current) {
      return;
    }

    const bbox = getBBox(
      areaLayer.show ? features.areaLayer?.shapes : undefined,
      symbolLayer.show ? features.symbolLayer?.points : undefined
    );
    if (bbox) {
      setViewState(constrainZoom(viewState, bbox));
    }

    hasSetInitialZoom.current = true;
  }, [
    viewState,
    features.areaLayer?.shapes,
    features.symbolLayer?.points,
    areaLayer,
    symbolLayer,
  ]);

  const mapNodeRef = useRef<MapRef | null>(null);
  const handleRefNode = (mapRef: MapRef) => {
    if (!mapRef) {
      return;
    }
    mapNodeRef.current = mapRef;
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
            onMove={onViewStateChange}
            ref={handleRefNode}
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

const ZoomButton = ({
  iconName,
  handleClick,
}: {
  iconName: IconName;
  handleClick: () => void;
}) => (
  <Button
    variant="contained"
    sx={{
      width: 32,
      height: 32,
      borderRadius: 4,
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
      "&:hover": {
        backgroundColor: "grey.200",
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
