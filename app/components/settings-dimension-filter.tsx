import { Label, Radio } from "@rebass/forms";
import { Dimension, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Box, Flex } from "rebass";
import { getDimensionLabel, useDimensionValues } from "../domain";
import { Loader } from "./Loader";

export const SettingsDimensionFilter = ({
  dataset,
  dimensions,
  filters,
  updateFilters
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  filters: Map<Dimension, string[]>;
  updateFilters: (x: any) => void;
}) => {
  return (
    <>
      <h3>Filter Dimension</h3>
      {dimensions.map(dimension => {
        return (
          <Flex mx={-2} mb={3}>
            <Box width={1 / 3} px={2}>
              <h4>{getDimensionLabel({ dimension })}</h4>
              <DimensionValues dataset={dataset} dimension={dimension} />
            </Box>
          </Flex>
        );
      })}
    </>
  );
};

const DimensionValues = ({
  dataset,
  dimension
}: {
  dataset: DataCube;
  dimension: Dimension;
}) => {
  const dimensionValues = useDimensionValues({ dataset, dimension });
  console.log({ dimensionValues });

  if (dimensionValues.state === "loaded") {
    return (
      <>
        {dimensionValues.data.map(dv => {
          return (
            <Label key={dv.value.value} width={[1]} p={1} m={0}>
              <Radio
                id={dv.value.value}
                name={dv.value.value}
                value={dv.value.value}
                // checked={
                //   dv.value.value ===
                //   filters.find((f: any) => f.dimension === dimensionLabel)
                // }
                // onChange={() =>
                //   setFilters({
                //     dimension,
                //     dimensionValue: dv.value.value
                //   })
                // }
              />
              {dv.label.value}
            </Label>
          );
        })}
      </>
    );
  } else {
    return <Loader body={"dimension values loading"} />;
  }
};
