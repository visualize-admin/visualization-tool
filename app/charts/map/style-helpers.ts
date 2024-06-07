import mapValues from "lodash/mapValues";
import { AnySourceData, MapboxStyle } from "react-map-gl/dist/esm/types";

type AnyLayer = MapboxStyle["layers"][number];

// @TODO Find a way to make those guards generic
type HasUrl<T> = T extends { url?: string | undefined } ? T : never;
function hasUrl(obj: AnySourceData): obj is HasUrl<AnySourceData> {
  return Object.prototype.hasOwnProperty.call(obj, "url");
}

type HasLayout<T> = T extends { layout?: infer T } ? T : never;
export function hasLayout(obj: AnyLayer): obj is HasLayout<AnySourceData> {
  return Object.prototype.hasOwnProperty.call(obj, "layout");
}

const replaceStringTokens = (
  s: string | undefined,
  tokens: Record<string, string>
) => {
  if (!s) {
    return s;
  }
  let cur = s;
  for (const [src, dest] of Object.entries(tokens)) {
    cur = cur.replace(src, dest!);
  }
  return cur;
};

export const replaceStyleTokens = (
  style: MapboxStyle,
  tokens: Record<string, string>
) => {
  return {
    ...style,
    sources: mapValues(style.sources, (v) => {
      return {
        ...v,
        // @ts-ignore
        url: hasUrl(v) ? replaceStringTokens(v.url, tokens) : undefined,
      };
    }),
    glyphs: replaceStringTokens(style.glyphs, tokens),
    sprite: replaceStringTokens(style.sprite, tokens),
  };
};

export const mapLayers = (
  style: MapboxStyle,
  layerIterator: (layer: AnyLayer) => AnyLayer | undefined
) => {
  return {
    ...style,
    layers: style.layers.map((x) => (x ? layerIterator(x) : undefined)),
  };
};
