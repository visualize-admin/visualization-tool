import { isNumber } from "util";
import { ObservationValue, Observation } from "../../domain/data";

export const getWideData = ({
  xKey,
  groupedMap,
  getSegment,
  getY,
}: {
  xKey: string;
  groupedMap: Map<string, Record<string, ObservationValue>[]>;
  getSegment: (d: Observation) => string;
  getY: (d: Observation) => number;
}) => {
  const wideArray = [];
  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce(
      (obj, cur) => {
        const currentKey = getSegment(cur);
        const currentY = isNumber(getY(cur)) ? getY(cur) : 0;
        const total = currentY + (obj.total as number);
        return {
          ...obj,
          [currentKey]: getY(cur),
          total,
        };
      },
      { total: 0 }
    );
    wideArray.push({
      ...keyObject,
      [xKey]: key,
    });
  }
  return wideArray;
};
