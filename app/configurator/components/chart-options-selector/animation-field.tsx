import { t, Trans } from "@lingui/macro";
import { Box, Tooltip, Typography } from "@mui/material";

import Flex from "@/components/flex";
import { RadioGroup } from "@/components/form";
import { type AnimationField as AnimationFieldType } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartOptionRadioField,
  ChartOptionSwitchField,
} from "@/configurator/components/field";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";

export const AnimationField = ({ field }: { field: AnimationFieldType }) => {
  return (
    <ControlSection collapse>
      <SectionTitle iconName="animation">
        <Trans id="controls.section.animation.settings">
          Animation Settings
        </Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
        <ChartOptionSwitchField
          label={t({
            id: "controls.section.animation.show-play-button",
            message: "Show Play button",
          })}
          field="animation"
          path="showPlayButton"
        />
        {field.showPlayButton && (
          <>
            <Box mt={4}>
              <Typography variant="caption" component="p" sx={{ mb: 1 }}>
                <Trans id="controls.section.animation.duration">
                  Animation Duration
                </Trans>
              </Typography>
              <RadioGroup>
                {[10, 30, 60].map((d) => (
                  <ChartOptionRadioField
                    key={d}
                    label={`${d}s`}
                    field="animation"
                    path="duration"
                    value={d}
                  />
                ))}
              </RadioGroup>
            </Box>
            <Box mt={4}>
              <Flex alignItems="center" sx={{ gap: 1, mb: 1 }}>
                <Typography variant="caption" component="p">
                  <Trans id="controls.section.animation.type">
                    Animation Type
                  </Trans>
                </Typography>
                <Tooltip
                  arrow
                  title={t({
                    id: "controls.section.animation.type.explanation",
                    message:
                      "Use the Stepped type to make the animation jump between data points at fixed intervals. This mode is useful when you want to animate data using a time dimension with a non-uniform distribution of dates.",
                  })}
                >
                  <Typography
                    sx={{ color: "primary.main", lineHeight: "0 !important" }}
                  >
                    <SvgIcInfoCircle width={16} height={16} />
                  </Typography>
                </Tooltip>
              </Flex>
              <RadioGroup>
                <ChartOptionRadioField
                  label={t({
                    id: "controls.section.animation.type.continuous",
                    message: "Continuous",
                  })}
                  field="animation"
                  path="type"
                  value="continuous"
                />
                <ChartOptionRadioField
                  label={t({
                    id: "controls.section.animation.type.stepped",
                    message: "Stepped",
                  })}
                  field="animation"
                  path="type"
                  value="stepped"
                />
              </RadioGroup>
            </Box>
            <Box display="flex" alignItems="center" mt={5} gap="0.5rem">
              <ChartOptionSwitchField
                label={t({
                  id: "controls.section.animation.dynamic-scaling",
                  message: "Dynamic Scaling",
                })}
                field="animation"
                path="dynamicScales"
              />
              <Tooltip
                arrow
                title={t({
                  id: "controls.section.animation.dynamic-scaling.explanation",
                  message:
                    "Enable dynamic scaling to adjust the chart's scale based on the data range, ensuring optimal visualization.",
                })}
              >
                <Typography
                  sx={{ color: "primary.main", lineHeight: "0 !important" }}
                >
                  <SvgIcInfoCircle width={16} height={16} />
                </Typography>
              </Tooltip>
            </Box>
          </>
        )}
      </ControlSectionContent>
    </ControlSection>
  );
};
