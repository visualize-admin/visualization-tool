import { getFieldComponentIris } from "@/charts";
import { isTemporalDimension } from "@/domain/data";
import {
  DataCubeMetadataWithComponentValuesQuery,
  TimeUnit,
} from "@/graphql/query-hooks";

import { ConfiguratorStateConfiguringChart } from "../config-types";

export const getDataFilterDimensions = (
  chartConfig: ConfiguratorStateConfiguringChart["chartConfig"],
  dataCube: NonNullable<
    DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
  >
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
