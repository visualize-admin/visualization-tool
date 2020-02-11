import React from "react";
import { Flex, Box } from "@theme-ui/components";
import { ChartTypeSelectorField } from "./field";
import { Loading, Hint } from "./hint";
import { getPossibleChartType } from "../domain";
import {
  ChartType,
  ConfiguratorStateSelectingChartType
} from "../domain/config-types";
import { Trans } from "@lingui/macro";
import { SectionTitle } from "./chart-controls";
import { useDataCubeMetadataWithComponentsQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

const chartTypes: ChartType[] = ["column", "line", "area", "scatterplot"];
export const ChartTypeSelector = ({
  state
}: {
  state: ConfiguratorStateSelectingChartType;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentsQuery({
    variables: { iri: state.dataSet, locale }
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;

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
          sx={{
            width: "100%",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "center"
          }}

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
