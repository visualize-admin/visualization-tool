import React from "react";
import { Flex } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";
import { ChartType } from "../domain/config-types";

const availableChartTypes: ChartType[] = [
  "column",
  "line",
  "area",
  "scatterplot"
];
export const ChartTypeSelector = ({
  chartId,
  dataSet
}: {
  chartId: string;
  dataSet: string;
}) => {
  const meta = useDataSetAndMetadata(dataSet);
  if (meta.state === "loaded") {
    return (
      <Flex
        width="100%"
        flexWrap="wrap"
        justifyContent="space-around"
        alignItems="center"
        // sx={{
        //   "&::after": {
        //     content: "''",
        //     flex: "auto"
        //   }
        // }}
      >
        {availableChartTypes.map(d => (
          <ChartTypeSelectorField
            key={d}
            type="radio"
            chartId={chartId}
            path={"chartType"}
            label={d}
            value={d}
            metaData={meta.data}
          />
        ))}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
