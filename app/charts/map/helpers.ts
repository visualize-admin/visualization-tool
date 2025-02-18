import { WebMercatorViewport } from "@deck.gl/core";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox";
import { extent } from "d3-array";
import { geoBounds } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import { useControl, ViewState } from "react-map-gl";
import { feature } from "topojson-client";

import { BBox, Filters } from "@/config-types";
import {
  AreaLayer,
  GeoCoordinates,
  GeoShapes,
  Observation,
  SymbolLayer,
} from "@/domain/data";
import useEvent from "@/utils/use-event";

type MinMaxZoomViewState = Pick<
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
 * @param chartDimensions Chart's dimensions needed to correctly initialize view state
 * in locked mode.
 */
const getViewStateFromBounds = ({
  width,
  height,
  bbox,
  padding = 0,
}: {
  width: number;
  height: number;
  padding?: number;
  bbox: BBox | undefined;
}) => {
  if (!bbox) {
    return;
  }

  const viewport = new WebMercatorViewport({
    ...BASE_VIEW_STATE,
    width: width * (1 - padding),
    height: height * (1 - padding),
  });
  const fitted = viewport.fitBounds(bbox);

  return { ...BASE_VIEW_STATE, ...fitted };
};

/**
 * @param bbox Bounding box saved in chart config or bounding box of visible features.
 * @param chartDimensions Chart's dimensions needed to correctly initialize view state
 * in locked mode.
 * @param locked Boolean describing whether a map is locked (interactions disabled,
 * bbox saved in chart config and maintained during resizing) or not (interactions allowed,
 * initial view state dynamically adjusted to fit visible features).
 */
export type ViewStateInitializationProps = {
  width: number;
  height: number;
  lockedBBox: BBox | undefined;
  featuresBBox: BBox | undefined;
};

/**
 * Hook used by a map chart that controls its view state.
 *
 * In addition to keeping track on the current view state, it also exposes
 * the initial view state of the map and makes sure that it contains all features
 * in the first place (if the map was not initialized with a locked mode).
 */
export const useViewState = (props: ViewStateInitializationProps) => {
  const { width, height, lockedBBox, featuresBBox } = props;
  const lockedViewState = useMemo(() => {
    return getViewStateFromBounds({
      width,
      height,
      bbox: lockedBBox,
    });
  }, [width, height, lockedBBox]);
  const defaultViewState = useMemo(() => {
    return (
      getViewStateFromBounds({
        width,
        height,
        padding: 1 / 4,
        bbox: featuresBBox,
      }) ?? BASE_VIEW_STATE
    );
  }, [width, height, featuresBBox]);

  // Locked view state takes precedence, as it must have come from a locked mode.
  const [viewState, setViewState] = useState(
    () => lockedViewState ?? defaultViewState
  );
  const onViewStateChange = useEvent(
    ({ viewState }: { viewState: ViewState }) => {
      setViewState((oldViewState) => ({ ...oldViewState, ...viewState }));
    }
  );

  // Update view state when locked or default view state changes.
  useEffect(() => {
    setViewState(lockedViewState ?? defaultViewState);
  }, [lockedViewState, defaultViewState]);

  return { defaultViewState, viewState, onViewStateChange };
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

export const prepareFeatureCollection = ({
  dimensionId,
  topology,
  filters,
  observations,
}: {
  dimensionId: string;
  topology: GeoShapes["topology"];
  filters: Filters[string];
  observations: Observation[];
}) => {
  const activeFiltersIris = filters
    ? filters.type === "single"
      ? [filters.value]
      : filters.type === "multi"
        ? Object.keys(filters.values)
        : undefined
    : undefined;

  const featureCollection = feature(
    topology,
    topology.objects.shapes
  ) as AreaLayer["shapes"];

  // Completely hide unselected shapes (so they don't affect the legend, etc)
  if (activeFiltersIris) {
    featureCollection.features = featureCollection.features.filter((d) => {
      return activeFiltersIris.includes(d.properties.iri);
    });
  }

  featureCollection.features.forEach((f) => {
    const observation = observations.find((o) => {
      const iri = o[`${dimensionId}/__iri__`];
      const label = o[dimensionId];

      return iri ? iri === f.properties.iri : label === f.properties.label;
    });

    f.properties = {
      ...f.properties,
      observation,
    };
  });

  return featureCollection;
};

// Used to render DeckGL layers in synchronization with base map layers.
export function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  }
) {
  // @ts-ignore
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);

  return null;
}

export const shouldRenderMap = ({
  areaDimensionId,
  symbolDimensionId,
  geometries,
  coordinates,
}: {
  areaDimensionId: string | undefined;
  symbolDimensionId: string | undefined;
  geometries: any[] | undefined;
  coordinates: GeoCoordinates | undefined;
}) => {
  const areaLayerPresent = !!(areaDimensionId !== "" && geometries);
  const symbolLayerPresent = !!(
    symbolDimensionId !== "" &&
    (coordinates || geometries)
  );
  const rawMap =
    !areaLayerPresent && !symbolLayerPresent && !!(geometries || coordinates);

  return areaLayerPresent || symbolLayerPresent || rawMap;
};
