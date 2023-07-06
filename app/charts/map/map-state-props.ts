import { geoCentroid } from "d3";
import keyBy from "lodash/keyBy";
import React from "react";
import { mesh } from "topojson-client";

import { prepareTopojson } from "@/charts/map/helpers";
import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  AreaLayerVariables,
  ChartStateData,
  SymbolLayerVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { MapConfig } from "@/configurator";
import {
  GeoData,
  GeoPoint,
  GeoShapes,
  isGeoCoordinatesDimension,
  isGeoDimension,
  isGeoShapesDimension,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { GeoCoordinates } from "@/rdf/query-geo-coordinates";

import { ChartProps } from "../shared/ChartProps";

export type MapStateVariables = AreaLayerVariables & SymbolLayerVariables;

export const useMapStateVariables = (
  chartProps: ChartProps<MapConfig>
): MapStateVariables => {
  const { chartConfig, dimensions } = chartProps;
  const { fields } = chartConfig;
  const { areaLayer, symbolLayer } = fields;

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

  return {
    areaLayerDimension,
    symbolLayerDimension,
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
  const { areaLayerDimension, symbolLayerDimension } = variables;
  // No need to sort the data for map.
  const plottableData = usePlottableData(observations, {});
  const { chartData, scalesData, segmentData } = useChartData(plottableData, {
    chartConfig,
  });

  const areaLayer = React.useMemo(() => {
    if (areaLayerDimension?.iri && shapes) {
      const { topology } = shapes;
      const topojson = prepareTopojson({
        dimensionIri: areaLayerDimension.iri,
        topology,
        filters: chartConfig.filters[areaLayerDimension.iri],
        observations: chartData,
      });

      return {
        shapes: topojson,
        mesh: mesh(topology, topology.objects.shapes),
      };
    }
  }, [areaLayerDimension?.iri, shapes, chartConfig.filters, chartData]);

  const symbolLayer = React.useMemo(() => {
    if (
      isGeoCoordinatesDimension(
        symbolLayerDimension as DimensionMetadataFragment | undefined
      ) &&
      coordinates
    ) {
      const points: GeoPoint[] = [];
      const coordsByLabel = keyBy(coordinates, (d) => d.label);

      // FIXME: chart data
      chartData.forEach((d) => {
        // FIXME: use getSymbolLayer
        // @ts-ignore
        const label = d[symbolLayerDimension.iri] as string;
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
      isGeoShapesDimension(
        symbolLayerDimension as DimensionMetadataFragment | undefined
      ) &&
      shapes
    ) {
      const { topology } = shapes;
      const topojson = prepareTopojson({
        // @ts-ignore
        dimensionIri: symbolLayerDimension.iri,
        topology,
        // @ts-ignore
        filters: chartConfig.filters[symbolLayerDimension.iri],
        observations: chartData,
      });

      const points = topojson.features.map((d) => ({
        ...d,
        coordinates: geoCentroid(d),
      }));

      return { points };
    }
  }, [
    symbolLayerDimension,
    chartData,
    shapes,
    coordinates,
    chartConfig.filters,
  ]);

  return {
    chartData,
    scalesData,
    segmentData,
    allData: plottableData,
    features: {
      areaLayer,
      symbolLayer,
    },
  };
};
