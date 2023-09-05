import { BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  getChartConfig,
} from "@/configurator";
import { useConfiguratorState } from "@/src";

import { ChartSelectionTabs } from "./chart-selection-tabs";

type ChartPanelProps = { children: ReactNode } & BoxProps;

export const ChartPanelConfigurator = (props: ChartPanelProps) => {
  // This type of chart panel can only appear for below steps.
  const [state] = useConfiguratorState() as unknown as [
    ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing
  ];
  const chartConfig = getChartConfig(state);

  return (
    <>
      <ChartSelectionTabs editable chartType={chartConfig.chartType} />
      <ChartPanelInner showTabs {...props} />
    </>
  );
};

export const ChartPanelPublished = (
  props: ChartPanelProps & { chartType: ChartType }
) => {
  const { chartType, ...rest } = props;

  return (
    <>
      <ChartSelectionTabs editable={false} chartType={chartType} />
      <ChartPanelInner showTabs={false} {...rest} />
    </>
  );
};

const useChartPanelInnerStyles = makeStyles<Theme, { showTabs: boolean }>(
  (theme: Theme) => ({
    root: {
      flexDirection: "column",
      backgroundColor: theme.palette.grey[100],
      border: "1px solid",
      borderColor: theme.palette.divider,
      // TODO: Handle properly when chart composition is implemented (enable when
      // ChartSelectionTabs becomes scrollable)
      overflow: "hidden",
      width: "auto",
    },
  })
);

const ChartPanelInner = ({
  children,
  showTabs = true,
  ...boxProps
}: ChartPanelProps & { showTabs: boolean }) => {
  const classes = useChartPanelInnerStyles({ showTabs });
  return (
    <Flex
      {...boxProps}
      className={classes.root}
      sx={{
        ...boxProps.sx,
        minHeight: [150, 300, 500],
      }}
    >
      {children}
    </Flex>
  );
};
