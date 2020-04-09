import { Box } from "@theme-ui/components";
import React, { memo, useMemo } from "react";
import { ChartFields, Observation } from "../domain";
import { ComponentFieldsFragment } from "../graphql/query-hooks";

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
    // const [sortingField, setSortingField] = useState();
    // const [direction, setDirection] = useState();

    // const sortBy = (fieldKey: string) => {
    //   let newDirection: "ascending" | "descending";
    //   let isAscending = direction === "ascending";
    //   if (fieldKey === sortingField) {
    //     newDirection = isAscending ? "descending" : "ascending";
    //   } else {
    //     newDirection = "ascending";
    //   }
    //   observations.sort((a, b) =>
    //     newDirection === "ascending"
    //       ? ascending(a[fieldKey], b[fieldKey])
    //       : descending(a[fieldKey], b[fieldKey])
    //   );
    //   setSortingField(fieldKey);
    //   setDirection(newDirection);
    // };

    const headers = useMemo(() => {
      const obsKeys = new Set(Object.keys(observations[0]));
      return [...dimensions, ...measures].filter((d) => obsKeys.has(d.iri));
    }, [dimensions, measures, observations]);

    return (
      <table style={{ display: "none" }}>
        <caption>{title}</caption>
        <tbody>
          <tr>
            {headers.map(({ iri, label }) => {
              // const isSortingField = sortingField === iri;
              return (
                <th
                  role="columnheader"
                  scope="col"
                  key={iri}
                  // aria-sort={isSortingField ? direction : "none"}
                >
                  {/* <button onClick={() => sortBy(iri)}> */}
                  <Box>{label}</Box>
                  {/* {isSortingField && (
                      <>
                        {", "}
                        <Trans id="accessibility.table.sorting">
                          sorted by {label} in
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
                    )} */}
                  {/* </button> */}
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
    );
  }
);
