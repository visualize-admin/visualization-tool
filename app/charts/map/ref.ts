import { Map } from "mapbox-gl";

let map: Map | null = null;

const getMap = () => {
  return map;
};

const setMap = (d: Map) => {
  map = d;
};

export { getMap, setMap };
