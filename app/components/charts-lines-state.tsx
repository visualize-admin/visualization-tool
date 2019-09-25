import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { Box, Flex } from "rebass";
import {
  getTimeDimensions,
  getCategoricalDimensions,
  getMeasuresDimensions,
  useFilteredObservations
} from "../domain";
import { ChartLines } from "./charts-lines";
import { SettingsDimensionSelect } from "./settings-dimension-select";
import { SettingsMeasureSelect } from "./settings-measure-select";
import { SettingsDimensionFilter } from "./settings-dimension-filter";

export const ChartLineState = ({
  dataset,
  namedSelection,
  dimensions,
  measures
}: {
  dataset: DataCube;
  namedSelection: any;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const [filters, updateFilters] = useState(
    () => new Map(dimensions.map(dimension => [dimension, []]))
  );
  const [groupByField, updateGroupByField] = useState(
    getCategoricalDimensions({ dimensions })[0]
  );
  const [xField, updateXField] = useState(getTimeDimensions({ dimensions })[0]);
  const [heightField, updateHeightField] = useState(measures[0]);

  const timeDimensions = getTimeDimensions({ dimensions });
  const categoricalDimensions = getCategoricalDimensions({ dimensions });
  const measuresDimensions = getMeasuresDimensions({ dimensions });

  return (
    <Flex>
      <Box width={1 / 3} px={2}>
        <SettingsDimensionSelect
          label={"X Axis (Time)"}
          dimensions={timeDimensions}
          selectedDimension={xField}
          updateDimension={updateXField}
        />
        <SettingsMeasureSelect
          label={"Y Axis (Values)"}
          measures={measuresDimensions}
          selectedMeasure={measuresDimensions[0]}
          updateMeasure={updateHeightField}
        />
        <SettingsDimensionSelect
          label={"Color (Categories)"}
          dimensions={categoricalDimensions}
          selectedDimension={groupByField}
          updateDimension={updateGroupByField}
        />
      </Box>

      <Box width={1 / 3} px={2}>
        <SettingsDimensionFilter
          dataset={dataset}
          dimensions={categoricalDimensions}
          filters={filters}
          updateFilters={updateFilters}
        />
      </Box>
      {/* // FIXME: move this to another components that fetches observations, with filters */}
      <Box width={1 / 3} px={2}>
        <Visualization
          dataset={dataset}
          namedSelection={namedSelection}
          dimensions={dimensions}
          filters={filters}
          xField={xField}
          groupByField={groupByField}
          heightField={heightField}
        />
      </Box>
    </Flex>
  );
};

const Visualization = ({
  dataset,
  namedSelection,
  dimensions,
  filters,
  xField,
  groupByField,
  heightField
}: {
  dataset: DataCube;
  namedSelection: any;
  dimensions: Dimension[];
  filters: Map<Dimension, string[]>;
  xField: Dimension;
  groupByField: Dimension;
  heightField: Dimension;
}) => {
  const observations = useFilteredObservations({
    dataset,
    namedSelection,
    filters
  });
  console.log("filters in Visualization", filters);
  if (observations.state === "loaded") {
    return (
      <ChartLines
        observations={observations.data.results}
        xField={xField}
        groupByField={groupByField}
        heightField={heightField}
        aggregationFunction={"sum"}
      />
    );
  } else {
    return <div>Updating data...</div>;
  }
};
