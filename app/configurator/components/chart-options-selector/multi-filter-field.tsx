import { Trans } from "@lingui/macro";
import get from "lodash/get";

import {
  EncodingFieldType,
  EncodingSpec,
} from "@/charts/chart-config-ui-options";
import { ChartConfig, isMapConfig } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  DimensionValuesMultiFilter,
  TimeFilter,
} from "@/configurator/components/filters";
import {
  Component,
  Dimension,
  isMeasure,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
} from "@/domain/data";

export const MultiFilterField = ({
  chartConfig,
  component,
  encoding,
  field,
  dimensions,
  measures,
}: {
  chartConfig: ChartConfig;
  component: Component | undefined;
  encoding: EncodingSpec;
  field: EncodingFieldType;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const colorComponentId = get(
    chartConfig,
    isMapConfig(chartConfig)
      ? `fields["${field}"].color.componentId`
      : `fields.segment.componentId`
  );
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.id === colorComponentId
  );

  return encoding.filters && component ? (
    <ControlSection data-testid="chart-edition-multi-filters" collapse>
      <SectionTitle disabled={!component} iconName="filter">
        <Trans id="controls.section.filter">Filter</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        <legend style={{ display: "none" }}>
          <Trans id="controls.section.filter">Filter</Trans>
        </legend>
        {/* For temporal-based segments, we want to treat values as nominal. */}
        {(isTemporalDimension(component) ||
          isTemporalEntityDimension(component)) &&
        field !== "segment" ? (
          <TimeFilter
            dimension={component}
            disableInteractiveFilters={encoding.disableInteractiveFilters}
          />
        ) : (
          component &&
          !isMeasure(component) && (
            <DimensionValuesMultiFilter
              dimension={component}
              field={field}
              colorComponent={colorComponent}
            />
          )
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};
