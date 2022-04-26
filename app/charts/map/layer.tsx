/**
 * Customisation of react-map-gl's Layer
 * The problem with react-map-gl is that when it does not work with
 * deck.gl layers since it spreads out the props from the layer without
 * copying the prototype
 *
 * Other changes
 * - Use for .. of on Object.entries instead of for in for Typescript
 */

import assert from "assert";

import isEqual from "lodash/isEqual";
import { Map } from "maplibre-gl";
import { useRef, useState, useMemo, useEffect } from "react";
import { LayerProps, useMap } from "react-map-gl";

import useChange from "@/utils/use-change";

const MIN_ZOOM = 0;
const MAX_ZOOM = 24;

function createLayer(
  map: Map,
  id: string,
  props: LayerProps,
  beforeId: string | undefined
) {
  // @ts-ignore
  if (map.style && map.style._loaded) {
    // @ts-ignore
    map.addLayer(props, beforeId);
  }
}

function updateLayer(
  map: Map,
  id: string,
  props: LayerProps,
  prevProps: LayerProps
) {
  assert(props.id === prevProps.id, "layer id changed");
  assert(props.type === prevProps.type, "layer type changed");

  if (props.type === "custom" || prevProps.type === "custom") {
    return;
  }

  const { layout = {}, paint = {}, filter, minzoom, maxzoom, beforeId } = props;

  if (beforeId !== prevProps.beforeId) {
    map.moveLayer(id, beforeId);
  }
  if (layout !== prevProps.layout) {
    const prevLayout = prevProps.layout;
    for (const [key, value] of Object.entries(layout)) {
      // @ts-ignore
      if (!isEqual(value, prevLayout[key])) {
        map.setLayoutProperty(id, key, value);
      }
    }
    for (const key in prevLayout) {
      if (!layout.hasOwnProperty(key)) {
        map.setLayoutProperty(id, key, undefined);
      }
    }
  }
  if (paint !== prevProps.paint) {
    const prevPaint = prevProps.paint || {};
    for (const [key, value] of Object.entries(paint)) {
      // @ts-ignore
      if (!isEqual(value, prevPaint[key])) {
        map.setPaintProperty(id, key, value);
      }
    }
  }
  if (!isEqual(filter, prevProps.filter)) {
    map.setFilter(id, filter);
  }
  if (minzoom !== prevProps.minzoom || maxzoom !== prevProps.maxzoom) {
    map.setLayerZoomRange(
      id,
      minzoom !== undefined ? minzoom : MIN_ZOOM,
      maxzoom !== undefined ? maxzoom : MAX_ZOOM
    );
  }
}

let layerCounter = 0;

const Layer = ({
  layer,
  beforeId,
}: {
  layer: LayerProps;
  beforeId?: string;
}) => {
  const map = useMap().current?.getMap() as unknown as Map;
  useChange(map, "map");
  const layerRef = useRef(layer);
  const [, setStyleLoaded] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const id = useMemo(() => layer.id || `jsx-layer-${layerCounter++}`, []);

  useEffect(() => {
    if (map) {
      const forceUpdate = () => setStyleLoaded((version) => version + 1);
      map.on("styledata", forceUpdate);
      map.on("load", forceUpdate);
      forceUpdate();

      return () => {
        map.off("load", forceUpdate);
        map.off("styledata", forceUpdate);
        // @ts-ignore
        if (map.style && map.style._loaded) {
          map.removeLayer(id);
        }
      };
    }
    return undefined;
  }, [map, id]);

  // @ts-ignore
  const mapLayer = map && map.style && map.getLayer(id);
  if (mapLayer) {
    updateLayer(map, id, layer, layerRef.current);
  } else if (map) {
    createLayer(map, id, layer, beforeId);
  }

  // Store last rendered props
  layerRef.current = layer;
  return null;
};

export default Layer;
