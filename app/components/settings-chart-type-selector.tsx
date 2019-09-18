import * as React from "react";
import { ChartType } from "../types";
import { Button, Flex, Box } from "rebass";

export const ChartTypeSelector = ({
  chartType,
  updateChartType
}: {
  chartType: ChartType;
  updateChartType: (x: ChartType) => void;
}) => {
  return (
    <Flex my={20} mb={3}>
      <Box width={[1, 1 / 2, 1 / 4]} p={2}>
        <Button
          variant="primary"
          width="100%"
          m={2}
          onClick={() => updateChartType("bar")}
          selected={chartType === "bar"}
          sx={{
            backgroundColor: chartType === "bar" ? "Orchid" : "grey"
          }}
        >
          Bar
        </Button>
      </Box>
      <Box width={[1, 1 / 2, 1 / 4]} p={2}>
        <Button
          variant="primary"
          width="100%"
          m={2}
          onClick={() => updateChartType("line")}
          selected={chartType === "line"}
          sx={{
            backgroundColor: chartType === "line" ? "Orchid" : "grey"
          }}
        >
          Line
        </Button>
      </Box>
      <Box width={[1, 1 / 2, 1 / 4]} p={2}>
        <Button
          variant="primary"
          width="100%"
          m={2}
          onClick={() => updateChartType("area")}
          selected={chartType === "area"}
          sx={{
            backgroundColor: chartType === "area" ? "Orchid" : "grey"
          }}
        >
          Area
        </Button>
      </Box>
      <Box width={[1, 1 / 2, 1 / 4]} p={2}>
        <Button
          variant="primary"
          width="100%"
          m={2}
          onClick={() => updateChartType("scatterplot")}
          selected={chartType === "scatterplot"}
          sx={{
            backgroundColor: chartType === "scatterplot" ? "Orchid" : "grey"
          }}
        >
          Scatterplot
        </Button>
      </Box>
    </Flex>
  );
};
