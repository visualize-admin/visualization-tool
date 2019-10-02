import { DataCube, Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import {
  getDimensionIri,
  getDimensionLabel,
  useDimensionValues
} from "../domain";
import { Field } from "./field";
import { Loader } from "./loader";

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
          <div key={getDimensionIri({ dimension })}>
            <h5>{getDimensionLabel({ dimension })}</h5>
            <DimensionValues
              chartId={chartId}
              dataSet={dataSet}
              dimension={dimension}
            />
          </div>
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
              label={dv.label.value}
              value={dv.value.value}
            />
          );
        })}
      </>
    );
  } else {
    return <Loader body={"dimension values loading"} />;
  }
};
