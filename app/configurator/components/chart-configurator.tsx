import { Trans } from "@lingui/macro";
import * as React from "react";
import { ChartConfig, ConfiguratorStateConfiguringChart } from "..";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
import { getFieldComponentIris } from "../../charts";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { DataFilterSelect, ControlTabField } from "./field";
import { Loading } from "../../components/hint";
import { Box } from "theme-ui";

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri)
    );

    return (
      <>
        <ControlSection>
          <SectionTitle titleId="controls-design">
            <Trans id="controls.section.design">Design</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-design"
          >
            <ChartFields
              chartConfig={state.chartConfig}
              metaData={data.dataCubeByIri}
            />
          </ControlSectionContent>
        </ControlSection>

        <ControlSection>
          <SectionTitle titleId="controls-data">
            <Trans id="controls.section.data">Data</Trans>
          </SectionTitle>
          <ControlSectionContent side="left" aria-labelledby="controls-data">
            {unMappedDimensions.map((dimension) => (
              <Box sx={{ px: 2, mb: 2 }} key={dimension.iri}>
                <DataFilterSelect
                  dimensionIri={dimension.iri}
                  label={dimension.label}
                  options={dimension.values.map((value) => ({
                    value: value.value,
                    label: value.label,
                  }))}
                  disabled={false}
                />
              </Box>
            ))}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  } else {
    return <Loading />;
  }
};

const ChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ChartConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  const { chartType } = chartConfig;
  return (
    <>
      {chartConfigOptionsUISpec[chartType].encodings.map((encoding) => {
        const encodingField = encoding.field;

        return (
          <ControlTabField
            key={encoding.field}
            component={components.find(
              (d) =>
                d.iri ===
                chartConfig.fields[encodingField as "y" | "segment"]
                  ?.componentIri
            )}
            value={encoding.field}
            labelId={`${chartConfig.chartType}.${encoding.field}`}
          />
        );
      })}
    </>
  );
};
