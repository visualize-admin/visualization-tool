import React from "react";
import { Flex } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading } from "./hint";
import { useDataSetAndMetadata, getRecommendedChartType } from "../domain";
import { ChartType } from "../domain/config-types";

const chartTypes: ChartType[] = ["column", "line", "area", "scatterplot"];
export const ChartTypeSelector = ({
  chartId,
  dataSet
}: {
  chartId: string;
  dataSet: string;
}) => {
  const meta = useDataSetAndMetadata(dataSet);
  if (meta.state === "loaded") {
    const recommendedChartTypes = getRecommendedChartType({
      chartTypes,
      meta: meta.data
    });
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
        {chartTypes.map(d => (
          <ChartTypeSelectorField
            key={d}
            type="radio"
            chartId={chartId}
            path={"chartType"}
            label={d}
            value={d}
            metaData={meta.data}
            disabled={!recommendedChartTypes.includes(d)}
          />
        ))}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
