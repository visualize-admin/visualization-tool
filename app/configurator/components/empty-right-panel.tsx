import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { ReactNode } from "react";

import { ConfiguratorStateConfiguringChart } from "@/configurator";

export const EmptyRightPanel = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => (
  <Typography component="div" variant="body2" sx={{ m: 4 }}>
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
    default:
      return "blabla";
  }
};
