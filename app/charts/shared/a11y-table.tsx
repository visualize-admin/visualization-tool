import { Box } from "@mui/material";
import { memo, useMemo } from "react";
import VisuallyHidden from "../../components/visually-hidden";
import { ChartFields } from "../../configurator";
import { Observation } from "../../domain/data";
import { DimensionMetaDataFragment } from "../../graphql/query-hooks";

export const A11yTable = memo(
  ({
    title,
    dimensions,
    measures,
    fields,
    observations,
  }: {
    title: string;
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
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
