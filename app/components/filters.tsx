import { DataCube, Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getDimensionIri,
  getDimensionLabel,
  useDimensionValues,
  isTimeDimension
} from "../domain";
import { Field } from "./field";
import { Loading } from "./hint";
import { ControlSection, ControlList } from "./chart-controls";

export const Filters = ({
  chartId,
  dataSet,
  dimensions
}: {
  chartId: string;
  dataSet: DataCube;
  dimensions: Dimension[];
}) => {
  return (
    <>
      {dimensions.map(dimension => {
        return (
          <ControlSection
            key={getDimensionIri(dimension)}
            title={getDimensionLabel(dimension)}
          >
            <ControlList>
              <DimensionValues
                chartId={chartId}
                dataSet={dataSet}
                dimension={dimension}
              />
            </ControlList>
          </ControlSection>
        );
      })}
    </>
  );
};

const DimensionValues = ({
  chartId,
  dataSet,
  dimension
}: {
  chartId: string;
  dataSet: DataCube;
  dimension: Dimension;
}) => {
  const dimensionValues = useDimensionValues({ dataSet, dimension });
  const dimensionIri = getDimensionIri(dimension);
  if (dimensionValues.state === "loaded") {
    return (
      <>
        {dimensionValues.data.map(dv => {
          return (
            <Field
              key={dv.value.value}
              type="checkbox"
              chartId={chartId}
              path={`filters["${dimensionIri}"]["${dv.value.value}"]`}
              label={
                isTimeDimension(dimension) ? dv.value.value : dv.label.value
              }
              value={dv.value.value}
              disabled={isTimeDimension(dimension)} // FIXME: disable time filter for now because of missing iri
            />
          );
        })}
      </>
    );
  } else {
    return <Loading>Fetching dimension values...</Loading>;
  }
};
