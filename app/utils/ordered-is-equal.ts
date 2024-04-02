import isEqual from "lodash/isEqual";

type Value = Record<string, unknown>;

export const orderedIsEqual = (obj1: Value, obj2: Value) => {
  return isEqual(Object.keys(obj1), Object.keys(obj2)) && isEqual(obj1, obj2);
};
