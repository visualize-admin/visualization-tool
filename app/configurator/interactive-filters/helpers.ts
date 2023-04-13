import { getFieldComponentIri, getFieldComponentIris } from "@/charts";
import { isTemporalDimension } from "@/domain/data";
import {
  DimensionMetadataFragment,
  TemporalDimension,
  TimeUnit,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";

import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
} from "../config-types";

export const getTimeSliderFilterDimensions = ({
  chartConfig,
  dataCubeByIri,
}: {
  chartConfig: ChartConfig;
  dataCubeByIri: {
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
  };
}): TemporalDimension[] => {
  if (dataCubeByIri) {
    const allComponents = [
      ...dataCubeByIri.dimensions,
      ...dataCubeByIri.measures,
    ];
    const xComponentIri = getFieldComponentIri(chartConfig.fields, "x");
    const xComponent = allComponents.find((d) => d.iri === xComponentIri);

    return allComponents.filter(
      (d) =>
        isTemporalDimension(d) &&
        (isTemporalDimension(xComponent) ? d.iri !== xComponent.iri : true)
    ) as TemporalDimension[];
  }

  return [];
};

export const getDataFilterDimensions = (
  chartConfig: ConfiguratorStateConfiguringChart["chartConfig"],
  dataCube: DataCubeMetadata
) => {
  const mappedIris = getFieldComponentIris(chartConfig.fields);
  // Dimensions that are not encoded in the visualization
  // excluding temporal and numerical dimensions
  const configurableDimensions = dataCube.dimensions.filter(
    (d) =>
      !mappedIris.has(d.iri) &&
      (!isTemporalDimension(d) || d.timeUnit === TimeUnit.Year) &&
      !d.isNumerical
  );

  return configurableDimensions;
};
