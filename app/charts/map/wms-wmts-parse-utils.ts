export const maybeArray = <T>(x: undefined | T | T[]): undefined | T[] => {
  if (x === undefined) {
    return undefined;
  } else if (Array.isArray(x)) {
    return x;
  } else {
    return [x];
  }
};

export const parseCrs = (crs: string) => {
  // parses the label (CRS:84) or URL style (urn:ogc:def:crs:EPSG::3857) of CRS
  // into namespace:number format
  const urn = /urn:ogc:def:crs:(?<namespace>.*):(?<version>[^:]*)?:(?<id>\d+)/;
  const label = /(?<namespace>.*):(?<id>\d+)/;
  const match = crs.match(urn) ?? crs.match(label);
  if (match?.groups) {
    const { namespace, id } = match.groups;
    return `${namespace}:${id}`;
  }
  return crs;
};
