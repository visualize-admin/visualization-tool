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
import { MapConfig, useChartConfigFilters } from "@/configurator";
import {
  GeoData,
  GeoPoint,
  isGeoCoordinatesDimension,
  isGeoDimension,
  isGeoShapesDimension,
} from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

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
    (d) => d.iri === areaLayer?.componentIri
  );

  if (areaLayerDimension && !isGeoShapesDimension(areaLayerDimension)) {
    throw Error(
      `Dimension <${areaLayerDimension.iri}> is not geo shapes dimension!`
    );
  }

  const symbolLayerDimension = dimensions.find(
    (d) => d.iri === symbolLayer?.componentIri
  );

  // Symbol layer dimension can be either GeoShapes or GeoCoordinates dimension.
  if (symbolLayerDimension && !isGeoDimension(symbolLayerDimension)) {
    throw Error(
      `Dimension <${symbolLayerDimension.iri}> is not geo dimension!`
    );
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
  // No need to sort the data for map.
  const plottableData = usePlottableData(observations, {});
  const data = useChartData(plottableData, {
    chartConfig,
  });

  const areaLayer = useMemo(() => {
    const iri = areaLayerDimension?.iri;

    if (!(iri && shapes)) {
      return;
    }

    const { topology } = shapes;
    const featureCollection = prepareFeatureCollection({
      dimensionIri: iri,
      topology,
      filters: filters[iri],
      observations: data.chartData,
    });

    return {
      shapes: featureCollection,
    };
  }, [areaLayerDimension?.iri, shapes, filters, data.chartData]);

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
      const iri = symbolLayerDimension.iri;
      const { features } = prepareFeatureCollection({
        dimensionIri: iri,
        topology,
        filters: filters[iri],
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
    allData: plottableData,
    features: {
      areaLayer,
      symbolLayer,
    },
  };
};
