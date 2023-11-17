import { geoCentroid } from "d3";
import keyBy from "lodash/keyBy";
import React from "react";
import { mesh } from "topojson-client";

import { prepareTopojson } from "@/charts/map/helpers";
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
  Dimension,
  GeoData,
  GeoPoint,
  GeoShapes,
  isGeoCoordinatesDimension,
  isGeoDimension,
  isGeoShapesDimension,
} from "@/domain/data";
import { GeoCoordinates } from "@/rdf/query-geo-coordinates";

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

  const { getValue: getArea } = useDimensionWithAbbreviations(
    areaLayerDimension,
    { observations, field: areaLayer }
  );

  const symbolLayerDimension = dimensions.find(
    (d) => d.iri === symbolLayer?.componentIri
  );

  // Symbol layer dimension can be either GeoShapes or GeoCoordinates dimension.
  if (symbolLayerDimension && !isGeoDimension(symbolLayerDimension)) {
    throw Error(
      `Dimension <${symbolLayerDimension.iri}> is not geo dimension!`
    );
  }

  const { getValue: getSymbol } = useDimensionWithAbbreviations(
    symbolLayerDimension,
    { observations, field: symbolLayer }
  );

  return {
    ...baseVariables,
    areaLayerDimension,
    getArea,
    symbolLayerDimension,
    getSymbol,
  };
};

export type MapStateData = ChartStateData & { features: GeoData };

export const useMapStateData = (
  // FIXME: should we also have aspect ratio here? Consolidate this
  // FIXME: share these chartProps types
  chartProps: ChartProps<MapConfig> & {
    shapes: GeoShapes | undefined;
    coordinates: GeoCoordinates[] | undefined | null;
  },
  variables: MapStateVariables
): MapStateData => {
  const { chartConfig, observations, shapes, coordinates } = chartProps;
  const { areaLayerDimension, symbolLayerDimension, getSymbol } = variables;
  const filters = useChartConfigFilters(chartConfig);
  // No need to sort the data for map.
  const plottableData = usePlottableData(observations, {});
  const data = useChartData(plottableData, {
    chartConfig,
  });

  const areaLayer = React.useMemo(() => {
    if (!(areaLayerDimension?.iri && shapes)) {
      return;
    }

    const { topology } = shapes;
    const topojson = prepareTopojson({
      dimensionIri: areaLayerDimension.iri,
      topology,
      filters: filters[areaLayerDimension.iri],
      observations: data.chartData,
    });

    return {
      shapes: topojson,
      mesh: mesh(topology, topology.objects.shapes),
    };
  }, [areaLayerDimension?.iri, shapes, filters, data.chartData]);

  const symbolLayer = React.useMemo(() => {
    if (
      isGeoCoordinatesDimension(
        symbolLayerDimension as Dimension | undefined
      ) &&
      coordinates
    ) {
      const points: GeoPoint[] = [];
      const coordsByLabel = keyBy(coordinates, (d) => d.label);

      data.chartData.forEach((d) => {
        const label = getSymbol(d);
        const coords = coordsByLabel[label];

        if (coords) {
          const { iri, label, latitude, longitude } = coords;
          // FIXME: create other object and do not store observation here.
          // This would make it possible to not re-create the layer on data change
          // and then, animate the colors.
          points.push({
            coordinates: [longitude, latitude] as [number, number],
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
    } else if (
      isGeoShapesDimension(symbolLayerDimension as Dimension | undefined) &&
      shapes
    ) {
      if (!symbolLayerDimension?.iri) {
        return;
      }

      const { topology } = shapes;
      const topojson = prepareTopojson({
        dimensionIri: symbolLayerDimension.iri,
        topology,
        filters: filters[symbolLayerDimension.iri],
        observations: data.chartData,
      });

      const points = topojson.features.map((d) => ({
        ...d,
        coordinates: geoCentroid(d),
      }));

      return { points };
    }
  }, [
    symbolLayerDimension,
    getSymbol,
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
