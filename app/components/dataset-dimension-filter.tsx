import { Label, Select } from "@rebass/forms";
import { DataCube, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Box, Flex } from "rebass";

export const DSFilter = ({
  observations,
  dimensions
}: {
  observations: { results: any[] };
  dimensions: Dimension[];
}) => {
  const dimensionsWithLabel = dimensions.map(dim => {
    const key = dim.labels[0].value;
    return [key, dim];
  });

  console.log({ observations });

  return (
    <>
      <h3>Filter Dimension</h3>
      {dimensionsWithLabel.map(dim => {
        const dimensionValues = Array.from(
          new Set(
            observations.results.map((obs: any) => obs["selectedDimension"])
          )
        );

        // console.log({ dimensionValues });

        return (
          <Flex mx={-2} mb={3}>
            <Box width={1 / 3} px={2}>
              <Label htmlFor={`select-${dim[0]}`}>{dim[0]}</Label>
              <Select id={`select-${dim[0]}`} name={`select-${dim[0]}`}>
                {dimensionValues.map((dv: any) => (
                  <option>{dv}</option>
                ))}
              </Select>
            </Box>
          </Flex>
        );
      })}
    </>
  );
};
