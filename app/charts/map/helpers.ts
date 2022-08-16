import { WebMercatorViewport } from "@deck.gl/core";
import { extent, geoBounds } from "d3";
import { useMemo, useState } from "react";
import { ViewState } from "react-map-gl";

import { BBox } from "@/configurator/config-types";
import useEvent from "@/lib/use-event";

import { AreaLayer, SymbolLayer } from "../../domain/data";
import { Bounds } from "../shared/use-width";

export type MinMaxZoomViewState = Pick<
  ViewState,
  "zoom" | "latitude" | "longitude"
> & {
  minZoom: number;
  maxZoom: number;
  width: number;
  height: number;
};

export const BASE_VIEW_STATE: MinMaxZoomViewState = {
  minZoom: 1,
  maxZoom: 13,
  latitude: 46.8182,
  longitude: 8.2275,
  zoom: 5,
  width: 400,
  height: 400,
};

/**
 * Compute map center along with a proper zoom level taking chart dimensions
 * into account.
 *
 * @param bbox Bounding box of the feature to be contained.
 * @param chartDimensions Chart's dimensions.
 */
export const getViewStateFromBounds = ({
  bbox,
  chartDimensions,
}: {
  bbox: BBox;
  chartDimensions: Bounds;
}) => {
  const vp = new WebMercatorViewport({
    ...BASE_VIEW_STATE,
    width: chartDimensions.width,
    height: chartDimensions.height,
  });
  const fitted = vp.fitBounds(bbox);

  return { ...BASE_VIEW_STATE, ...fitted };
};

/**
 * Constrain the viewState to always _contain_ the supplied bbox.
 *
 * (Other implementations ensure that the bbox _covers_ the viewport)
 *
 * @param viewState deck.gl viewState
 * @param bbox Bounding box of the feature to be contained
 */
export const constrainZoom = (
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

type ViewStateInitializationProps = {
  bbox: BBox | undefined;
  chartDimensions: Bounds;
  locked: boolean;
};

export const initializeViewState = ({
  bbox,
  chartDimensions,
  locked,
}: ViewStateInitializationProps) => {
  return bbox && locked
    ? getViewStateFromBounds({ bbox, chartDimensions })
    : BASE_VIEW_STATE;
};

export const useViewState = (props: ViewStateInitializationProps) => {
  const { bbox, locked } = props;
  const [viewState, setViewState] = useState(initializeViewState(props));

  const onViewStateChange = useEvent(
    ({ viewState }: { viewState: ViewState }) => {
      setViewState((oldViewState) => ({ ...oldViewState, ...viewState }));
    }
  );

  // Needed to be able to "reset" the map to its initial position.
  const initialViewState = useMemo(() => {
    let newViewState: MinMaxZoomViewState | undefined = undefined;

    if (bbox && !locked) {
      newViewState = constrainZoom(viewState, bbox);
      setViewState(newViewState);
    }

    return newViewState ?? viewState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { initialViewState, viewState, onViewStateChange };
};

export const getBBox = (
  shapes?: AreaLayer["shapes"],
  symbols?: SymbolLayer["points"]
) => {
  let shapesBbox: BBox | undefined;
  let symbolsBbox: BBox | undefined;

  if (shapes) {
    const _shapesBbox = geoBounds(shapes);
    if (!_shapesBbox.flat().some(isNaN)) {
      shapesBbox = _shapesBbox;
    }
  }

  if (symbols) {
    const visiblePoints = symbols.filter(
      (d) => d.properties.observation !== undefined
    );

    if (visiblePoints.length > 0) {
      const [minLng, maxLng] = extent(visiblePoints, (d) => d.coordinates[0]);
      const [minLat, maxLat] = extent(visiblePoints, (d) => d.coordinates[1]);

      symbolsBbox = [
        [minLng, minLat],
        [maxLng, maxLat],
      ] as BBox;
    }
  }

  if (shapesBbox !== undefined) {
    if (symbolsBbox !== undefined) {
      const [minLng, maxLng] = [
        Math.min(shapesBbox[0][0], symbolsBbox[0][0]),
        Math.max(shapesBbox[1][0], symbolsBbox[1][0]),
      ];
      const [minLat, maxLat] = [
        Math.min(shapesBbox[0][1], symbolsBbox[0][1]),
        Math.max(shapesBbox[1][1], symbolsBbox[1][1]),
      ];
      const bbox = [
        [minLng, minLat],
        [maxLng, maxLat],
      ] as BBox;

      return bbox;
    } else {
      return shapesBbox;
    }
  } else {
    return symbolsBbox;
  }
};
