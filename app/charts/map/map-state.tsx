import {
  color,
  extent,
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
  identicalLayerComponentIris: boolean;
  areaLayer: {
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
    getColor: (x: number | null) => number[];
    colorScale:
      | ScaleSequential<string>
      | ScaleQuantize<string>
      | ScaleQuantile<string>
      | ScaleLinear<string, string>
      | ScaleThreshold<number, string>;
    paletteType: PaletteType;
    palette: string;
    nbClass: number;
    dataDomain: [number, number];
  };
  symbolLayer: {
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
    color: string;
    radiusScale: ScalePower<number, number>;
    dataDomain: [number, number];
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

  const getAreaLabel = useStringVariable(fields.areaLayer.componentIri);
  const getSymbolLabel = useStringVariable(fields.symbolLayer.componentIri);
  const getAreaValue = useOptionalNumericVariable(fields.areaLayer.measureIri);
  const getSymbolValue = useOptionalNumericVariable(
    fields.symbolLayer.measureIri
  );

  const identicalLayerComponentIris =
    fields.areaLayer.componentIri === fields.symbolLayer.componentIri;

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

  const areaDataDomain = (extent(data, (d) => getAreaValue(d)) || [0, 100]) as [
    number,
    number
  ];

  const symbolDataDomain = (extent(data, (d) => getSymbolValue(d)) || [
    0, 100,
  ]) as [number, number];

  const colorScale = getColorScale({
    paletteType,
    palette,
    getValue: getAreaValue,
    data,
    dataDomain: areaDataDomain,
    nbClass,
  });

  const getAreaColor = (v: number | null) => {
    if (v === null) {
      return [0, 0, 0, 255 * 0.1];
    }

    const c = colorScale && colorScale(v);
    const rgb = c && color(`${c}`)?.rgb();

    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const radiusExtent: [number, number] = [0, symbolDataDomain[1]];
  const radiusRange = [0, 24];
  const radiusScale = scaleSqrt().domain(radiusExtent).range(radiusRange);

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
    identicalLayerComponentIris,
    areaLayer: {
      show: fields.areaLayer.show,
      measureLabel: areaMeasureLabel,
      getLabel: getAreaLabel,
      getValue: getAreaValue,
      getColor: getAreaColor,
      colorScale,
      paletteType,
      palette,
      nbClass: nbClass,
      dataDomain: areaDataDomain,
    },
    symbolLayer: {
      color: fields.symbolLayer.color,
      measureLabel: symbolMeasureLabel,
      show: fields.symbolLayer.show,
      getLabel: getSymbolLabel,
      radiusScale,
      getValue: getSymbolValue,
      dataDomain: symbolDataDomain,
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
