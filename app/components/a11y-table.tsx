import { Box } from "@theme-ui/components";
import React, { memo, useMemo } from "react";
import { ChartFields, Observation } from "../domain";
import { ComponentFieldsFragment } from "../graphql/query-hooks";
import VisuallyHidden from "@reach/visually-hidden";

export const A11yTable = memo(
  ({
    title,
    dimensions,
    measures,
    fields,
    observations,
  }: {
    title: string;
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: ChartFields;
    observations: Observation[];
  }) => {
    const headers = useMemo(() => {
      const obsKeys = new Set(Object.keys(observations[0]));
      return [...dimensions, ...measures].filter((d) => obsKeys.has(d.iri));
    }, [dimensions, measures, observations]);

    return (
      <VisuallyHidden>
        <table>
          <caption>{title}</caption>
          <tbody>
            <tr>
              {headers.map(({ iri, label }) => {
                return (
                  <th role="columnheader" scope="col" key={iri}>
                    <Box>{label}</Box>
                  </th>
                );
              })}
            </tr>
            {observations.map((obs, i) => {
              return (
                <tr key={i}>
                  {headers.map(({ iri }) => (
                    <td key={iri}>{obs[iri]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </VisuallyHidden>
    );
  }
);
