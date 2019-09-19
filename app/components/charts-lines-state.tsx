import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { Box, Flex } from "rebass";
import { getTimeDimensions, getCategoricalDimensions } from "../domain";
import { ChartLines } from "./charts-lines";
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
  const [groupByField, updateGroupByField] = useState(
    getCategoricalDimensions({ dimensions })[0]
  );
  const [xField, updateXField] = useState(getTimeDimensions({ dimensions })[0]);
  const [heightField, updateHeightField] = useState(measures[0]);

  const timeDimensions = getTimeDimensions({ dimensions });
  const categoricalDimensions = getCategoricalDimensions({ dimensions });
  return (
    <Flex>
      <Box width={1 / 3} px={2}>
        <DSDimensionSelect
          label={"Time dimensions"}
          dimensions={timeDimensions}
          selectedDimension={xField}
          updateDimension={updateXField}
        />
        <DSDimensionSelect
          label={"Categorical dimensions"}
          dimensions={categoricalDimensions}
          selectedDimension={groupByField}
          updateDimension={updateGroupByField}
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
          groupByField={groupByField}
          heightField={heightField}
          aggregationFunction={"sum"}
        />
      </Box>
    </Flex>
  );
};
