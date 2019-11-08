import React from "react";
import { Flex, Box } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading, Hint } from "./hint";
import { useDataSetAndMetadata, getPossibleChartType } from "../domain";
import { ChartType } from "../domain/config-types";
import { Trans } from "@lingui/macro";

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
    const possibleChartTypes = getPossibleChartType({
      chartTypes,
      meta: meta.data
    });
    return (
      <Box as="fieldset">
        <legend style={{ display: "none" }}>
          <Trans>Chart-Typ auswählen</Trans>
        </legend>
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
          {!possibleChartTypes ? (
            <Hint>
              <Trans>
                Mit ausgewähltem Datensatz kann kein Graphik dargestellt werden
              </Trans>
            </Hint>
          ) : (
            chartTypes.map(d => (
              <ChartTypeSelectorField
                key={d}
                type="radio"
                chartId={chartId}
                path={"chartType"}
                label={d}
                value={d}
                metaData={meta.data}
                disabled={!possibleChartTypes.includes(d)}
              />
            ))
          )}
        </Flex>
      </Box>
    );
  } else {
    return <Loading />;
  }
};
