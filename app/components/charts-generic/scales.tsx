import {
  schemeCategory10,
  schemeAccent,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3
} from "d3-scale-chromatic";
import { scaleOrdinal, scaleLinear, scaleTime } from "d3-scale";
import { Observation } from "../../domain";

import { extent, min, max } from "d3-array";
import { parseDate, isNumber, mkNumber } from "../../domain/helpers";
import { useBounds } from "./observer";

export const useColorScale = ({
  data,
  field,
  palette
}: {
  data: Observation[];
  field: string;
  palette?: string | undefined;
}) =>
  scaleOrdinal(getPalette(palette)).domain(data.map(d => d[field] as string));

export const useWidthLinearScale = ({
  data,
  field
}: {
  data: Observation[];
  field: string;
}) => {
  const bounds = useBounds();
  const { chartWidth } = bounds;
  const domain = extent(data, d => +d[field]);

  if (isNumber(domain[0]) && isNumber(domain[1])) {
    return scaleLinear()
      .domain([mkNumber(domain[0]), mkNumber(domain[1])])
      .range([0, chartWidth])
      .nice();
  } else {
    throw new Error("in useWidthLinearScale, the domain cannot be computed!");
  }
};

export const useWidthTimeScale = ({
  data,
  field
}: {
  data: Observation[];
  field: string;
}) => {
  const bounds = useBounds();
  const { chartWidth } = bounds;
  const domain = extent(data, d => parseDate(+d[field]));

  if (domain[0] && domain[1]) {
    return scaleTime()
      .domain(domain)
      .range([0, chartWidth])
      .nice();
  } else {
    throw new Error(
      "in useWidthTimeScale, the time domain cannot be computed!"
    );
  }
};

export const useHeightLinearScale = ({
  data,
  field
}: {
  data: Observation[];
  field: string;
}) => {
  const bounds = useBounds();
  const { chartHeight } = bounds;

  const minValue = min(data, d => +d[field]);
  const maxValue = max(data, d => +d[field]);

  if (isNumber(minValue) && isNumber(maxValue)) {
    return scaleLinear()
      .domain([mkNumber(minValue), mkNumber(maxValue)])
      .range([chartHeight, 0])
      .nice();
  } else {
    throw new Error("in useHeightLinearScale, the domain cannot be computed!");
  }
};

const getPalette = (palette: string | undefined): ReadonlyArray<string> => {
  switch (palette) {
    case "accent":
      return schemeAccent;
    case "category10":
      return schemeCategory10;
    //  case 'category20':
    //   return schemeCategory20;
    //  case 'category20b':
    //   return schemeCategory20b;
    //  case 'category20c':
    //   return schemeCategory20c;
    case "dark2":
      return schemeDark2;
    case "paired":
      return schemePaired;
    case "pastel1":
      return schemePastel1;
    case "pastel2":
      return schemePastel2;
    case "set1":
      return schemeSet1;
    case "set2":
      return schemeSet2;
    case "set3":
      return schemeSet3;
    default:
      return schemeCategory10;
  }
};
