/* eslint-disable react/jsx-no-undef */
import { t, Trans } from "@lingui/macro";
import { useEffect } from "react";

import { getMap } from "@/charts/map/ref";
import { MapConfig } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionSwitchField,
} from "@/configurator/components/field";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";

export const BaseLayerField = ({ chartConfig }: { chartConfig: MapConfig }) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const locked = chartConfig.baseLayer.locked;

  useEffect(() => {
    if (locked) {
      const map = getMap();

      if (!map) {
        return;
      }

      const bbox = map.getBounds().toArray();

      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field: null,
          path: "baseLayer.bbox",
          value: bbox,
        },
      });
    } else {
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field: null,
          path: "baseLayer.bbox",
          value: undefined,
        },
      });
    }
  }, [dispatch, locale, locked]);

  return (
    <ControlSection hideTopBorder>
      <SectionTitle closable>
        <Trans id="chart.map.layers.base">Base Layers</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        <ChartOptionCheckboxField
          label={t({
            id: "chart.map.layers.base.show",
            message: "Show",
          })}
          field={null}
          path="baseLayer.show"
        />
        <ChartOptionSwitchField
          label={t({
            id: "chart.map.layers.base.view.locked",
            message: "Locked view",
          })}
          field={null}
          path="baseLayer.locked"
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
