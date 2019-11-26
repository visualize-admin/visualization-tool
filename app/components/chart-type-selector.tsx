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
  const meta = useDataSetAndMetadata(state.dataSet);
  if (meta.state === "loaded") {
    const possibleChartTypes = getPossibleChartType({
      chartTypes,
      meta: meta.data
    });
    return (
      <Box as="fieldset">
        <legend style={{ display: "none" }}>
          <Trans>Chart Type</Trans>
        </legend>
        <SectionTitle>
          <Trans>Chart Type</Trans>
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
              <Trans>
                No visualization can be created with the selected dataset.
              </Trans>
            </Hint>
          ) : (
            chartTypes.map(d => (
              <ChartTypeSelectorField
                key={d}
                type="radio"
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
