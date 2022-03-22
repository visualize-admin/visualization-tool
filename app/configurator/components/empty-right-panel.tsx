import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { ReactNode } from "react";
import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
} from "..";

export const EmptyRightPanel = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStateDescribingChart;
}) => (
  <Typography component="div" variant="body1" sx={{ m: 4 }}>
    {getRightPanelHint(state.state)}
  </Typography>
);

const getRightPanelHint = (state: string): ReactNode => {
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
