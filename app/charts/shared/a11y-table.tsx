import { Box } from "@mui/material";
import { memo, useMemo } from "react";

import { VisuallyHidden } from "@/components/visually-hidden";
import { Dimension, Measure, Observation } from "@/domain/data";

export const A11yTable = memo(
  ({
    title,
    dimensions,
    measures,
    observations,
  }: {
    title: string;
    dimensions: Dimension[];
    measures: Measure[];
    observations: Observation[];
  }) => {
    const headers = useMemo(() => {
      const obsKeys = new Set(Object.keys(observations[0]));
      return [...dimensions, ...measures].filter((d) => obsKeys.has(d.id));
    }, [dimensions, measures, observations]);

    return (
      <VisuallyHidden>
        <table>
          <caption>{title}</caption>
          <tbody>
            <tr>
              {headers.map(({ id, label }) => {
                return (
                  <th key={id} role="columnheader" scope="col">
                    <Box>{label}</Box>
                  </th>
                );
              })}
            </tr>
            {observations.map((obs, i) => {
              return (
                <tr key={i}>
                  {headers.map(({ id }) => (
                    <td key={id}>{obs[id]}</td>
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
