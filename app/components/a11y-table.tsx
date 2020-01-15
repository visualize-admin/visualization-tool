import { DataCube } from "@zazuko/query-rdf-data-cube";
import { ascending, descending } from "d3-array";
import React, { useState, memo, useMemo } from "react";
import {
  Observations,
  DimensionWithMeta,
  MeasureWithMeta,
  ChartFields
} from "../domain";
import { Trans } from "@lingui/macro";
import { ChartFieldsWithLabel } from "./data-download";

export const A11yTable = memo(
  ({
    dataSet,
    dimensions,
    measures,
    fields,
    observations
  }: {
    dataSet: DataCube;
    dimensions: DimensionWithMeta[];
    measures: MeasureWithMeta[];
    fields: ChartFields;
    observations: Observations<ChartFields>;
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
    const fieldsWithLabel: ChartFieldsWithLabel = useMemo(
      () =>
        Object.entries(fields).reduce(
          (obj, [key, value]) => ({
            ...obj,
            [key]: [...dimensions, ...measures].find(
              c => c.component.iri.value === value?.componentIri
            )?.component.label.value
          }),
          {}
        ),
      [dimensions, fields, measures]
    );

    return (
      <table style={{ display: "none" }}>
        <caption>{dataSet.label.value}</caption>
        <tbody>
          <tr>
            {Object.entries(fields).map(([fieldKey, fieldValue]) => {
              return (
                <th
                  role="columnheader"
                  scope="col"
                  key={fieldKey}
                  aria-sort={sortingField === fieldKey ? direction : "none"}
                >
                  <button onClick={() => sortBy(fieldKey)}>
                    {fieldsWithLabel[fieldKey]}
                    {sortingField && (
                      <>
                        {", "}
                        <Trans id="accessibility.table.sorting">
                          sorted by {fieldsWithLabel[sortingField]} in
                          {direction === "ascending" ? (
                            <Trans id="accessibility.table.sorting.ascending">
                              ascending
                            </Trans>
                          ) : (
                            <Trans id="accessibility.table.sorting.descending">
                              descending
                            </Trans>
                          )}{" "}
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
                  <td key={fieldKey}>{obs[fieldKey]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
);
