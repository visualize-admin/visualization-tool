import { getFieldComponentIri } from "@/charts";
import { isTemporalDimension } from "@/domain/data";
import {
  DimensionMetadataFragment,
  TemporalDimension,
} from "@/graphql/query-hooks";

import { ChartConfig } from "../config-types";

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
