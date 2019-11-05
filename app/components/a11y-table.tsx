import { DataCube } from "@zazuko/query-rdf-data-cube";
import { ascending, descending } from "d3-array";
import React, { useState } from "react";
import {
  Fields,
  Observations,
  DimensionWithMeta,
  MeasureWithMeta
} from "../domain";
import { Trans } from "@lingui/macro";

export const A11yTable = ({
  dataSet,
  dimensions,
  measures,
  fields,
  observations
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: Fields;
  observations: Observations<Fields>;
}) => {
  const [sortingField, setSortingField] = useState();
  const [direction, setDirection] = useState();

  const sortBy = (fieldKey: string) => {
    let newDirection: "ascending" | "descending";
    let isAscending = direction === "ascending";
    if (fieldKey === sortingField) {
      newDirection = isAscending ? "descending" : "ascending";
    } else {
      newDirection = "ascending";
    }
    observations.sort((a, b) =>
      newDirection === "ascending"
        ? ascending(a[fieldKey], b[fieldKey])
        : descending(a[fieldKey], b[fieldKey])
    );
    setSortingField(fieldKey);
    setDirection(newDirection);
  };

  // FIXME: Add actual label
  return (
    <table style={{ display: "none" }}>
      <caption>{dataSet.labels[0].value}</caption>
      <tbody>
        <tr>
          {Object.entries(fields).map(([fieldKey, fieldValue]) => {
            return (
              <th>
                <button onClick={() => sortBy(fieldKey)}>
                  {fieldKey}
                  {sortingField && (
                    <>
                      {", "}
                      <Trans>
                        sorted by {sortingField} in
                        {direction === "ascending"
                          ? "ascending"
                          : "descending"}{" "}
                        order
                      </Trans>
                    </>
                  )}
                </button>
              </th>
            );
          })}
        </tr>
        {observations.map((obs, i) => {
          return (
            <tr key={i}>
              {Object.keys(fields).map(fieldKey => (
                <td>{obs[fieldKey]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
