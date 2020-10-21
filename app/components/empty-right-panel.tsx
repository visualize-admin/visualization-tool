import { Text } from "@theme-ui/components";
import * as React from "react";
import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
} from "../configurator";
import { Trans } from "@lingui/macro";

export const EmptyRightPanel = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStateDescribingChart;
}) => (
  <Text variant="paragraph1" sx={{ m: 4 }}>
    {getRightPanelHint(state.state)}
  </Text>
);

const getRightPanelHint = (state: string): React.ReactNode => {
  switch (state) {
    case "CONFIGURING_CHART":
      return (
        <Trans id="controls.hint.configuring.chart">
          Select a chart element or a data dimension in the left panel to modify
          its options.
        </Trans>
      );
    case "DESCRIBING_CHART":
      return (
        <Trans id="controls.hint.describing.chart">
          Select an annotation field in the left panel.
        </Trans>
      );
    default:
      return "blabla";
  }
};
