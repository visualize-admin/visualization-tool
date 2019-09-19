import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { Box, Flex } from "rebass";

import { ChartLines } from "./charts-line";
// import { DSBars } from "./chart-bars";
import { DSDimensionSelect } from "./settings-dimension-select";

export const ChartLineState = ({
  dimensions,
  measures,
  observations
}: {
  dimensions: Dimension[];
  measures: Measure[];
  observations: any;
}) => {
  const [dimensionFilter, addDimensionFilter] = useState({}); // {dimension: dimensionValue[]}
  const [xField, updateXField] = useState(dimensions[0]);
  const [heightField, updateHeightField] = useState(measures[0]);

  return (
    <Flex>
      <Box width={1 / 3} px={2}>
        <DSDimensionSelect
          dimensions={dimensions}
          selectedDimension={xField}
          updateDimension={updateXField}
        />
        {/* <DSFilter
            observations={observations.data}
            namedDimensions={namedDimensions}
          /> */}
      </Box>
      <Box width={1 / 3} px={2}>
        <ChartLines
          observations={observations}
          xField={xField}
          heightField={heightField}
          aggregationFunction={"sum"}
        />
      </Box>
    </Flex>
  );
};
