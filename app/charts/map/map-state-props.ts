import { geoCentroid } from "d3-geo";
import keyBy from "lodash/keyBy";
import { useMemo } from "react";

import { ChartMapProps } from "@/charts/map/chart-map";
import { prepareFeatureCollection } from "@/charts/map/helpers";
import {
  useDimensionWithAbbreviations,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
import {
  AreaLayerVariables,
  BaseVariables,
  ChartStateData,
  SymbolLayerVariables,
  useBaseVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { useChartConfigFilters } from "@/config-utils";
import { MapConfig } from "@/configurator";
import {
  GeoData,
  GeoPoint,
  isGeoCoordinatesDimension,
  isGeoDimension,
  isGeoShapesDimension,
} from "@/domain/data";

import { ChartProps } from "../shared/chart-props";

export type MapStateVariables = BaseVariables &
  AreaLayerVariables &
  SymbolLayerVariables;

export const useMapStateVariables = (
  chartProps: ChartProps<MapConfig>
): MapStateVariables => {
  const { chartConfig, observations, dimensions } = chartProps;
  const { fields } = chartConfig;
  const { areaLayer, symbolLayer } = fields;

  const baseVariables = useBaseVariables(chartConfig);

  // TODO: add abbreviations
  const areaLayerDimension = dimensions.find(
    (d) => d.id === areaLayer?.componentId
  );

  if (areaLayerDimension && !isGeoShapesDimension(areaLayerDimension)) {
    throw Error(
      `Dimension <${areaLayerDimension.id}> is not geo shapes dimension!`
    );
  }

  const symbolLayerDimension = dimensions.find(
    (d) => d.id === symbolLayer?.componentId
  );

  // Symbol layer dimension can be either GeoShapes or GeoCoordinates dimension.
  if (symbolLayerDimension && !isGeoDimension(symbolLayerDimension)) {
    throw Error(`Dimension <${symbolLayerDimension.id}> is not geo dimension!`);
  }

  const { getValue: getSymbol, getLabel: getSymbolLabel } =
    useDimensionWithAbbreviations(symbolLayerDimension, {
      observations,
      field: symbolLayer,
    });

  return {
    ...baseVariables,
    areaLayerDimension,
    symbolLayerDimension,
    getSymbol,
    getSymbolLabel,
  };
};

export type MapStateData = ChartStateData & { features: GeoData };

export const useMapStateData = (
  // FIXME: should we also have aspect ratio here? Consolidate this
  chartProps: ChartMapProps,
  variables: MapStateVariables
): MapStateData => {
  const { chartConfig, observations, shapes, coordinates } = chartProps;
  const {
    areaLayerDimension,
    symbolLayerDimension,
    getSymbol,
    getSymbolLabel,
  } = variables;
  const filters = useChartConfigFilters(chartConfig);
  const plottableData = usePlottableData(observations, {});
  const data = useChartData(plottableData, {
    chartConfig,
    timeRangeDimensionId: undefined,
  });

  const areaLayer = useMemo(() => {
    const id = areaLayerDimension?.id;

    if (!(id && shapes)) {
      return;
    }

    const { topology } = shapes;
    const featureCollection = prepareFeatureCollection({
      dimensionId: id,
      topology,
      filters: filters[id],
      observations: data.chartData,
    });

    return {
      shapes: featureCollection,
    };
  }, [areaLayerDimension?.id, shapes, filters, data.chartData]);

  const symbolLayer = useMemo(() => {
    if (isGeoCoordinatesDimension(symbolLayerDimension) && coordinates) {
      const points: GeoPoint[] = [];
      const coordsByLabel = keyBy(coordinates, (d) => d.label);

      data.chartData.forEach((d) => {
        const value = getSymbol(d);
        const label = getSymbolLabel(value);
        const coords = coordsByLabel[value] ?? coordsByLabel[label];

        if (coords) {
          const { iri, label, latitude, longitude } = coords;
          // FIXME: create other object and do not store observation here.
          // This would make it possible to not re-create the layer on data change
          // and then, animate the colors.
          points.push({
            coordinates: [longitude, latitude],
            properties: {
              iri,
              label,
              observation: d,
            },
          });
        }
      });

      return {
        points,
      };
    } else if (isGeoShapesDimension(symbolLayerDimension) && shapes) {
      const { topology } = shapes;
      const id = symbolLayerDimension.id;
      const { features } = prepareFeatureCollection({
        dimensionId: id,
        topology,
        filters: filters[id],
        observations: data.chartData,
      });

      const points = features.map((d) => ({
        ...d,
        coordinates: geoCentroid(d),
      }));

      return {
        points,
      };
    }
  }, [
    symbolLayerDimension,
    getSymbol,
    getSymbolLabel,
    data.chartData,
    shapes,
    coordinates,
    filters,
  ]);

  return {
    ...data,
    features: {
      areaLayer,
      symbolLayer,
    },
  };
};
