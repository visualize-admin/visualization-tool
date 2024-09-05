import { t } from "@lingui/macro";
import {
  Divider,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";

import {
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Icon, IconName } from "@/icons";

type PreviewBreakpoint = "lg" | "md" | "sm";

export const usePreviewBreakpoint = () => {
  const [state] = useConfiguratorState(isLayouting);
  const [breakpoint, setBreakpoint] = useState<PreviewBreakpoint | null>(null);
  const layoutRef = useRef(state.layout);
  useEffect(() => {
    if (!breakpoint) {
      layoutRef.current = state.layout;
    }
  }, [breakpoint, state.layout]);

  return {
    previewBreakpoint: breakpoint,
    setPreviewBreakpoint: setBreakpoint,
    previewBreakpointLayout: layoutRef.current,
  };
};

export const PreviewBreakpointToggleMenu = ({
  value,
  onChange,
}: {
  value: PreviewBreakpoint | null;
  onChange: (value: PreviewBreakpoint | null) => void;
}) => {
  const classes = useStyles();
  return (
    <ToggleButtonGroup
      className={classes.toggleButtonGroup}
      color="primary"
      value={value}
      exclusive
    >
      {PREVIEW_BREAKPOINT_OPTIONS.map(({ breakpoint, iconName, title }) => {
        return (
          <Fragment key={breakpoint}>
            <Tooltip title={title} arrow enterDelay={1000}>
              <ToggleButton
                className={clsx(classes.toggleButton, {
                  [classes.toggleButtonSelected]: value === breakpoint,
                })}
                value={breakpoint}
                onClick={() => onChange(breakpoint)}
              >
                <Icon name={iconName} size={16} />
              </ToggleButton>
            </Tooltip>
            {breakpoint !== "sm" && (
              <Divider
                className={classes.divider}
                orientation="vertical"
                flexItem
              />
            )}
          </Fragment>
        );
      })}
    </ToggleButtonGroup>
  );
};

const PREVIEW_BREAKPOINT_OPTIONS: {
  breakpoint: PreviewBreakpoint;
  iconName: IconName;
  title: string;
}[] = [
  {
    breakpoint: "lg",
    iconName: "desktop",
    title: t({
      id: "controls.layout.preview-lg",
      message: "Preview using available width",
    }),
  },
  {
    breakpoint: "md",
    iconName: "tabletPortrait",
    title: t({
      id: "controls.layout.preview-md",
      message: "Preview using medium width",
    }),
  },
  {
    breakpoint: "sm",
    iconName: "mobilePortrait",
    title: t({
      id: "controls.layout.preview-sm",
      message: "Preview using small width",
    }),
  },
];

const useStyles = makeStyles<Theme>((theme) => ({
  toggleButtonGroup: {
    float: "right",
    backgroundColor: theme.palette.background.paper,
  },
  toggleButton: {
    border: "none",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
    },
  },
  toggleButtonSelected: {
    color: theme.palette.primary.main,
  },
  divider: {
    alignSelf: "center",
    height: 16,
  },
}));
