import React from "react";
import { Flex, Box } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading, Hint } from "./hint";
import { useDataSetAndMetadata, getPossibleChartType } from "../domain";
import {
  ChartType,
  ConfiguratorStateSelectingChartType
} from "../domain/config-types";
import { Trans } from "@lingui/macro";
import { SectionTitle } from "./chart-controls";

const chartTypes: ChartType[] = ["column", "line", "area", "scatterplot"];
export const ChartTypeSelector = ({
  state
}: {
  state: ConfiguratorStateSelectingChartType;
}) => {
  const { data: metaData } = useDataSetAndMetadata(state.dataSet);
  if (metaData) {
    const possibleChartTypes = getPossibleChartType({
      chartTypes,
      meta: metaData
    });
    return (
      <Box as="fieldset">
        <legend style={{ display: "none" }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </legend>
        <SectionTitle>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SectionTitle>
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
              <Trans id="hint.no.visualization.with.dataset">
                No visualization can be created with the selected dataset.
              </Trans>
            </Hint>
          ) : (
            chartTypes.map(d => (
              <ChartTypeSelectorField
                key={d}
                label={d}
                value={d}
                metaData={metaData}
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
