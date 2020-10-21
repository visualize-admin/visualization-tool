import { Trans } from "@lingui/macro";
import { Box, Grid } from "@theme-ui/components";
import React from "react";
import { getPossibleChartType } from "../charts";
import {
  ChartType,
  ConfiguratorStateSelectingChartType,
} from "../configurator";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { SectionTitle } from "./chart-controls/section";
import { ChartTypeSelectorField } from "./field";
import { Hint, Loading } from "./hint";

const chartTypes: ChartType[] = [
  // "bar",
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
];
export const ChartTypeSelector = ({
  state,
}: {
  state: ConfiguratorStateSelectingChartType;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;

    const possibleChartTypes = getPossibleChartType({
      chartTypes,
      meta: metaData,
    });

    return (
      <Box as="fieldset">
        <legend style={{ display: "none" }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </legend>
        <SectionTitle>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SectionTitle>

        {!possibleChartTypes ? (
          <Hint>
            <Trans id="hint.no.visualization.with.dataset">
              No visualization can be created with the selected dataset.
            </Trans>
          </Hint>
        ) : (
          <Grid
            sx={{
              gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
              mx: 4,
            }}
          >
            {chartTypes.map((d) => (
              <ChartTypeSelectorField
                key={d}
                label={d}
                value={d}
                metaData={metaData}
                disabled={!possibleChartTypes.includes(d)}
              />
            ))}
          </Grid>
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};
