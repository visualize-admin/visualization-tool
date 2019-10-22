import { DataCube, Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getDimensionIri,
  getDimensionLabel,
  useDimensionValues
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
            key={getDimensionIri({ dimension })}
            title={getDimensionLabel({ dimension })}
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
  const dimensionIri = getDimensionIri({ dimension });
  // FIXME: workaround time dimension
  const isTimeDimension = ["Jahr", "Année", "Anno", "Year"].includes(
    dimension.labels[0].value
  );
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
              label={isTimeDimension ? dv.value.value : dv.label.value}
              value={dv.value.value}
              disabled={isTimeDimension} // FIXME: disable time filter for now because of missing iri
            />
          );
        })}
      </>
    );
  } else {
    return <Loading>Fetching dimension values...</Loading>;
  }
};
