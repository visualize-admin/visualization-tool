import {
  color,
  extent,
  max,
  ScaleLinear,
  scaleLinear,
  ScalePower,
  ScaleQuantile,
  scaleQuantile,
  ScaleQuantize,
  scaleQuantize,
  scaleSequential,
  ScaleSequential,
  scaleSqrt,
  ScaleThreshold,
  scaleThreshold,
} from "d3";
import { ReactNode, useMemo } from "react";
import { ckmeans } from "simple-statistics";
import {
  getColorInterpolator,
  getSingleHueSequentialPalette,
} from "../../configurator/components/ui-helpers";
import {
  MapFields,
  MapSettings,
  PaletteType,
} from "../../configurator/config-types";
import { GeoPoint, Observation } from "../../domain/data";
import {
  useOptionalNumericVariable,
  useStringVariable,
} from "../shared/chart-helpers";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { MapTooltipProvider } from "./map-tooltip";

export type GeoData = {
  lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
  areaLayer?: {
    shapes: GeoJSON.FeatureCollection | GeoJSON.Feature;
    mesh: GeoJSON.MultiLineString;
  };
  symbolLayer?: Array<GeoPoint>;
};
export interface MapState {
  chartType: "map";
  bounds: Bounds;
  data: Observation[];
  features: GeoData;
  showRelief: boolean;
  showLakes: boolean;
  areaLayer: {
    showAreaLayer: boolean;
    areaMeasureLabel: string;
    getLabel: (d: Observation) => string;
    getColor: (x: number | null) => number[];
    getValue: (d: Observation) => number | null;
    paletteType: PaletteType;
    palette: string;
    nbClass: number;
    dataDomain: [number, number];
    colorScale:
      | ScaleSequential<string>
      | ScaleQuantize<string>
      | ScaleQuantile<string>
      | ScaleLinear<string, string>
      | ScaleThreshold<number, string>;
  };
  symbolLayer: {
    color: string;
    showSymbolLayer: boolean;
    symbolMeasureLabel: string;
    radiusScale: ScalePower<number, number>;
    getRadius: (d: Observation) => number | null;
  };
}

const getColorScale = ({
  paletteType,
  palette,
  getValue,
  data,
  dataDomain,
  nbClass,
}: {
  paletteType: PaletteType;
  palette: string;
  getValue: (x: Observation) => number | null;
  data: Observation[];
  dataDomain: [number, number];
  nbClass: number;
}) => {
  const paletteDomain = getSingleHueSequentialPalette({
    palette,
    nbClass: 9,
  });

  switch (paletteType) {
    case "continuous":
      return scaleSequential(getColorInterpolator(palette)).domain(dataDomain);
    case "discrete":
      return scaleQuantize<string>()
        .domain(dataDomain)
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    case "quantile":
      return scaleQuantile<string>()
        .domain(data.map((d) => getValue(d)))
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    case "jenks":
      const ckMeansThresholds = ckmeans(
        data.map((d) => getValue(d) ?? NaN),
        nbClass
      ).map((v) => v.pop() || 0);

      return scaleThreshold<number, string>()
        .domain(ckMeansThresholds)
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    default:
      return scaleLinear<string>()
        .domain(dataDomain)
        .range([paletteDomain[0], paletteDomain[paletteDomain.length - 1]]);
  }
};

const useMapState = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  settings,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  features: GeoData;
  fields: MapFields;
  settings: MapSettings;
}): MapState => {
  const width = useWidth();
  const { palette, nbClass, paletteType } = fields["areaLayer"];

  const getLabel = useStringVariable(fields.areaLayer.componentIri);
  const getValue = useOptionalNumericVariable(fields.areaLayer.measureIri);
  const getRadius = useOptionalNumericVariable(fields.symbolLayer.measureIri);

  const areaMeasureLabel = useMemo(
    () =>
      measures.find((m) => m.iri === fields["areaLayer"].measureIri)?.label ||
      "",
    [fields, measures]
  );
  const symbolMeasureLabel = useMemo(
    () =>
      measures.find((m) => m.iri === fields["symbolLayer"].measureIri)?.label ||
      "",
    [fields, measures]
  );
  const dataDomain = (extent(data, (d) => getValue(d)) || [0, 100]) as [
    number,
    number
  ];

  const colorScale = getColorScale({
    paletteType,
    palette,
    getValue,
    data,
    dataDomain,
    nbClass,
  });

  const getColor = (v: number | null) => {
    if (v === null) {
      return [0, 0, 0, 255 * 0.1];
    }

    const c = colorScale && colorScale(v);
    const rgb = c && color(`${c}`)?.rgb();

    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const radiusExtent = [0, max(data, (d) => getRadius(d))];
  const radiusRange = radiusExtent[0] === 0 ? [0, 23] : [0, 23];
  const radiusScale = scaleSqrt()
    .domain(radiusExtent as [number, number])
    .range(radiusRange);

  // Dimensions
  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * 0.5;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  return {
    chartType: "map",
    data,
    features,
    bounds,
    showRelief: settings.showRelief,
    showLakes: settings.showLakes,
    areaLayer: {
      areaMeasureLabel,
      showAreaLayer: fields.areaLayer.show,
      getLabel,
      getColor,
      getValue,
      paletteType,
      palette,
      nbClass: nbClass,
      dataDomain,
      colorScale,
    },
    symbolLayer: {
      color: fields.symbolLayer.color,
      symbolMeasureLabel,
      showSymbolLayer: fields.symbolLayer.show,
      radiusScale,
      getRadius,
    },
  };
};

const MapChartProvider = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  settings,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  features: GeoData;
  children: ReactNode;
  fields: MapFields;
  settings: MapSettings;
}) => {
  const state = useMapState({
    data,
    features,
    fields,
    dimensions,
    measures,
    settings,
    interactiveFiltersConfig,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const MapChart = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  settings,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  features: GeoData;
  fields: MapFields;
  settings: MapSettings;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <MapTooltipProvider>
          <MapChartProvider
            data={data}
            features={features}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            settings={settings}
            interactiveFiltersConfig={interactiveFiltersConfig}
          >
            {children}
          </MapChartProvider>
        </MapTooltipProvider>
      </InteractionProvider>
    </Observer>
  );
};
