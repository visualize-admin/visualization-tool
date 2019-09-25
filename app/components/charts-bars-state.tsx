import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { Box, Flex } from "rebass";
import { ChartBars } from "./charts-bars";
import { SettingsDimensionSelect } from "./settings-dimension-select";
import { getCategoricalDimensions } from "../domain";

export const ChartBarState = ({
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

  const categoricalDimensions = getCategoricalDimensions({ dimensions });
  // const filteredData = observations.filter(obs => )
  return (
    <Flex>
      <Box width={1 / 3} px={2}>
        <SettingsDimensionSelect
          dimensions={categoricalDimensions}
          selectedDimension={xField}
          updateDimension={updateXField}
        />
        {/* <DSFilter
            observations={observations.data}
            namedDimensions={namedDimensions}
          /> */}
      </Box>
      <Box width={1 / 3} px={2}>
        <ChartBars
          observations={observations}
          xField={xField}
          heightField={heightField}
          aggregationFunction={"sum"}
        />
      </Box>
    </Flex>
  );
};
