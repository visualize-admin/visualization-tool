import { extent, geoBounds } from "d3";
import { AreaLayer, SymbolLayer } from "../../domain/data";

export type BBox = [[number, number], [number, number]];

export const getBBox = (
  shapes?: AreaLayer["shapes"],
  symbols?: SymbolLayer["points"]
) => {
  let shapesBbox: BBox | undefined;
  let symbolsBbox: BBox | undefined;

  if (shapes) {
    const _shapesBbox = geoBounds(shapes);
    if (!_shapesBbox.flat().some(isNaN)) {
      shapesBbox = geoBounds(shapes);
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
