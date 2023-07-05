import { geoCentroid } from "d3";
import keyBy from "lodash/keyBy";
import { useCallback, useState } from "react";
import { mesh as topojsonMesh } from "topojson-client";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { prepareTopojson } from "@/charts/map/helpers";
import { MapComponent } from "@/charts/map/map";
import { MapLegend } from "@/charts/map/map-legend";
import { MapChart } from "@/charts/map/map-state";
import { MapTooltip } from "@/charts/map/map-tooltip";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer } from "@/charts/shared/containers";
import { BaseLayer, DataSource, MapConfig, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  AreaLayer,
  GeoData,
  GeoPoint,
  GeoShapes,
  Observation,
  SymbolLayer,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
} from "@/domain/data";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useGeoCoordinatesByDimensionIriQuery,
  useGeoShapesByDimensionIriQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartMapVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: MapConfig;
  queryFilters: QueryFilters;
  published: boolean;
}) => {
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const areaDimensionIri = chartConfig.fields.areaLayer?.componentIri || "";
  const symbolDimensionIri = chartConfig.fields.symbolLayer?.componentIri || "";
  const commonQueryVariables = {
    iri: dataSetIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const componentIris = published
    ? extractComponentIris(chartConfig)
    : undefined;
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsQuery] = useComponentsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
      filters: queryFilters,
    },
  });
  const { data: componentsData } = componentsQuery;
  const { data: observationsData } = observationsQuery;

  const dimensions = componentsData?.dataCubeByIri?.dimensions;
  const measures = componentsData?.dataCubeByIri?.measures;
  const observations = observationsData?.dataCubeByIri?.observations.data;

  const [{ data: fetchedGeoCoordinates, error: geoCoordinatesError }] =
    useGeoCoordinatesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: symbolDimensionIri,
        locale,
      },
      pause: !symbolDimensionIri || symbolDimensionIri === "",
    });

  const geoCoordinatesDimension =
    fetchedGeoCoordinates?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoCoordinatesDimension"
      ? fetchedGeoCoordinates.dataCubeByIri.dimensionByIri.geoCoordinates
      : undefined;

  const geoShapesIri = areaDimensionIri || symbolDimensionIri;
  const [{ data: fetchedGeoShapes, error: geoShapesError }] =
    useGeoShapesByDimensionIriQuery({
      variables: {
        dataCubeIri: dataSetIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        dimensionIri: geoShapesIri,
        locale,
      },
      pause: !geoShapesIri || geoShapesIri === "",
    });

  const geoShapesDimension =
    fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
    "GeoShapesDimension"
      ? (fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes as GeoShapes)
      : undefined;

  const observationsQueryResp = {
    ...observationsQuery,
    data:
      measures && dimensions && observations && ready
        ? observationsQuery["data"]
        : undefined,
    error: observationsQuery.error ?? geoCoordinatesError ?? geoShapesError,
  };

  const prepareCustomProps = useCallback(
    ({
      chartData,
    }: {
      chartData: Observation[];
      scalesData: Observation[];
      segmentData: Observation[];
    }) => {
      const makeAreaLayer: () => AreaLayer | undefined = () => {
        const dimension = dimensions?.find((d) => d.iri === areaDimensionIri);

        if (isGeoShapesDimension(dimension) && geoShapesDimension) {
          const { topology } = geoShapesDimension;
          const topojson = prepareTopojson({
            dimensionIri: areaDimensionIri,
            topology,
            filters: chartConfig.filters[areaDimensionIri],
            observations: chartData,
          });

          return {
            shapes: topojson,
            mesh: topojsonMesh(topology, topology.objects.shapes),
          };
        }
      };

      const areaLayer = makeAreaLayer();

      const makeSymbolLayer: () => SymbolLayer | undefined = () => {
        const dimension = dimensions?.find((d) => d.iri === symbolDimensionIri);

        if (isGeoCoordinatesDimension(dimension) && geoCoordinatesDimension) {
          const points: GeoPoint[] = [];
          const coordsByLabel = keyBy(geoCoordinatesDimension, (d) => d.label);

          chartData.forEach((observation) => {
            const label = observation[symbolDimensionIri] as string;
            const coords = coordsByLabel[label];

            if (coords) {
              const { iri, label, latitude, longitude } = coords;
              points.push({
                coordinates: [longitude, latitude] as [number, number],
                properties: {
                  iri,
                  label,
                  observation,
                },
              });
            }
          });

          return { points };
        } else {
          if (isGeoShapesDimension(dimension) && geoShapesDimension) {
            const { topology } = geoShapesDimension;
            const topojson = prepareTopojson({
              dimensionIri: symbolDimensionIri,
              topology,
              filters: chartConfig.filters[symbolDimensionIri],
              observations: chartData,
            });

            const points = topojson.features.map((d) => ({
              ...d,
              coordinates: geoCentroid(d),
            }));

            return { points };
          }
        }
      };

      const symbolLayer = makeSymbolLayer();

      const areaLayerPrepared =
        areaDimensionIri !== "" ? areaLayer !== undefined : true;
      const symbolLayerPrepared =
        symbolDimensionIri !== "" ? symbolLayer !== undefined : true;

      const ready =
        (areaLayerPrepared &&
          // check if original, unfiltered number of shapes is bigger than 0
          (geoShapesDimension?.topology?.objects?.shapes as any)?.geometries
            ?.length) ||
        (symbolLayerPrepared && symbolLayer?.points.length) ||
        // Raw map without any data layer.
        (areaDimensionIri === "" && symbolDimensionIri === "");

      setReady(ready);

      return {
        features: { areaLayer, symbolLayer } as GeoData,
        baseLayer: chartConfig.baseLayer as BaseLayer,
      };
    },
    [
      chartConfig.filters,
      chartConfig.baseLayer,
      dimensions,
      geoCoordinatesDimension,
      geoShapesDimension,
      areaDimensionIri,
      symbolDimensionIri,
    ]
  );

  return (
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQueryResp}
      Component={ChartMap}
      prepareCustomProps={prepareCustomProps}
      chartConfig={chartConfig}
    />
  );
};

export const ChartMap = (
  props: ChartProps<MapConfig> & { features: GeoData; baseLayer: BaseLayer }
) => {
  const { chartConfig, dimensions } = props;
  const { fields } = chartConfig;

  return (
    <MapChart {...props}>
      <ChartContainer>
        <MapComponent />
        <MapTooltip />
      </ChartContainer>
      <MapLegend chartConfig={chartConfig} />
      {fields.animation && (
        <TimeSlider
          componentIri={fields.animation.componentIri}
          dimensions={dimensions}
          showPlayButton={fields.animation.showPlayButton}
          animationDuration={fields.animation.duration}
          animationType={fields.animation.type}
        />
      )}
    </MapChart>
  );
};
