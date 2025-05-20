import { t } from "@lingui/macro";
import { useCallback, useMemo } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { ChartConfig, ComponentType } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { makeGetFieldOptionGroups } from "@/configurator/components/chart-options-selector/utils";
import { ChartOptionSelectField } from "@/configurator/components/field";
import {
  Component,
  Dimension,
  getComponentsFilteredByType,
  Measure,
} from "@/domain/data";

export const SizeField = ({
  chartConfig,
  field,
  componentTypes,
  dimensions,
  measures,
  getFieldOptionGroups,
  optional,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  componentTypes: ComponentType[];
  dimensions: Dimension[];
  measures: Measure[];
  getFieldOptionGroups: ReturnType<typeof makeGetFieldOptionGroups>;
  optional: boolean;
}) => {
  const fieldComponents = useMemo(() => {
    return getComponentsFilteredByType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    });
  }, [componentTypes, dimensions, measures]);
  const getOption = useCallback(
    (c: Component) => ({ value: c.id, label: c.label }),
    []
  );
  const options = useMemo(() => {
    return chartConfig.cubes.length === 1 ? fieldComponents.map(getOption) : [];
  }, [chartConfig.cubes.length, fieldComponents, getOption]);
  const optionGroups = useMemo(() => {
    return chartConfig.cubes.length > 1
      ? getFieldOptionGroups({ fieldComponents, getOption })
      : undefined;
  }, [
    chartConfig.cubes.length,
    fieldComponents,
    getFieldOptionGroups,
    getOption,
  ]);

  return (
    <ControlSection collapse>
      <SectionTitle iconName="size">
        {t({
          id: "controls.size",
          message: "Size",
        })}
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="size-measure"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          field={field}
          path="measureId"
          options={options}
          optionGroups={optionGroups}
          optional={optional}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
