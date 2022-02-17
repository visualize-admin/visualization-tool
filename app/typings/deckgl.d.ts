declare module "@deck.gl/core" {
  export class MapController {}
  export class HoverObject {
    x: number;
    y: number;
    object: { id: number };
  }
  export class FlyToInterpolator {}
  export class WebMercatorViewport {
    constructor(viewState: $FixMe);
    width: number;
    height: number;
    project(lonlat: [number, number]): [number, number];
    unproject(xy: [number, number]): [number, number];
    fitBounds(
      bbox: [[number, number], [number, number]],
      options?: {
        padding?: number;
        offset?: [number, number];
      }
    ): {
      zoom: number;
      longitude: number;
      latitude: number;
    };
  }
}
declare module "@deck.gl/layers" {
  export const GeoJsonLayer: $FixMe;
  export const ScatterplotLayer: $FixMe;
  export const LineLayer: $FixMe;
  export const PathLayer: $FixMe;
  export const BitmapLayer: $FixMe;
}
declare module "@deck.gl/geo-layers" {
  export const TileLayer: $FixMe;
  export const MVTLayer: $FixMe;
}
declare module "@deck.gl/extensions" {
  export const FillStyleExtension: $FixMe;
}
declare module "@deck.gl/react" {
  export const DeckGL: $FixMe;
  export default DeckGL;
}

declare module "@deck.gl/carto" {
  export const BASEMAP: $FixMe;
}
