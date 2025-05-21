import { Trans } from "@lingui/macro";

import { RadioGroup } from "@/components/form";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartOptionRadioField,
  ChartOptionSwitchField,
} from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";

export const CalculationField = ({
  disabled,
  warnMessage,
}: {
  disabled?: boolean;
  warnMessage?: string;
}) => {
  return (
    <ControlSection collapse>
      <SectionTitle iconName="normalize" warnMessage={warnMessage}>
        <Trans id="controls.select.calculation.mode">Chart mode</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <RadioGroup>
          <ChartOptionRadioField
            label={getFieldLabel("identity")}
            field={null}
            path="interactiveFiltersConfig.calculation.type"
            value="identity"
            disabled={disabled}
          />
          <ChartOptionRadioField
            label={getFieldLabel("percent")}
            field={null}
            path="interactiveFiltersConfig.calculation.type"
            value="percent"
            disabled={disabled}
          />
        </RadioGroup>
        <ChartOptionSwitchField
          label={
            <MaybeTooltip
              tooltipProps={{ enterDelay: 600 }}
              title={
                <Trans id="controls.filters.interactive.calculation">
                  Allow users to change chart mode
                </Trans>
              }
            >
              <div>
                <Trans id="controls.filters.interactive.toggle">
                  Interactive
                </Trans>
              </div>
            </MaybeTooltip>
          }
          field={null}
          path="interactiveFiltersConfig.calculation.active"
          disabled={disabled}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
