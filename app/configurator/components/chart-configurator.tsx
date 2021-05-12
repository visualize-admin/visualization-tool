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
    const requiredFilterDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri) && dim.isKeyDimension
    );
    const optionalFilterDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri) && !dim.isKeyDimension
    );

    return (
      <>
        <ControlSection>
          <SectionTitle titleId="controls-design">
            <Trans id="controls.section.chart.options">Chart Options</Trans>
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
            <Trans id="controls.section.data.filters">Filters</Trans>
          </SectionTitle>
          <ControlSectionContent side="left" aria-labelledby="controls-data">
            {requiredFilterDimensions.map((dimension, i) => (
              <Box sx={{ px: 2, mb: 2 }} key={dimension.iri}>
                <DataFilterSelect
                  dimensionIri={dimension.iri}
                  label={dimension.label}
                  options={dimension.values}
                  disabled={false}
                  id={`select-single-filter-${i}`}
                />
              </Box>
            ))}
            {optionalFilterDimensions.map((dimension, i) => (
              <Box sx={{ px: 2, mb: 2 }} key={dimension.iri}>
                <DataFilterSelect
                  dimensionIri={dimension.iri}
                  label={dimension.label}
                  options={dimension.values}
                  disabled={false}
                  isOptional
                  id={`select-single-filter-${i}`}
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
