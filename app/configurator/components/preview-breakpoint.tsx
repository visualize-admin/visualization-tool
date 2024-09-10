import { t } from "@lingui/macro";
import {
  Divider,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

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

const SINGLE_COLUMN_MAX_WIDTH = 1280;
const PREVIEW_CONTAINER_PADDING = 216;

export const PreviewContainer = ({
  children,
  breakpoint,
  singleColumn,
}: {
  children: React.ReactNode;
  breakpoint: PreviewBreakpoint | null;
  singleColumn?: boolean;
}) => {
  const classes = useStyles();
  const { breakpoints } = useTheme();
  const maxWidth = useMemo(() => {
    if (breakpoint) {
      switch (breakpoint) {
        case "lg":
          return `calc(100% - ${PREVIEW_CONTAINER_PADDING}px)`;
        case "md":
          return `min(calc(100% - ${PREVIEW_CONTAINER_PADDING}px), ${breakpoints.values.md}px)`;
        case "sm":
          return 480;
        default:
          const _exhaustiveCheck: never = breakpoint;
          return _exhaustiveCheck;
      }
    }
    return singleColumn ? SINGLE_COLUMN_MAX_WIDTH : "100%";
  }, [breakpoint, breakpoints, singleColumn]);
  return (
    <div className={classes.container} style={{ maxWidth }}>
      {children}
    </div>
  );
};

export const PreviewBreakpointToggleMenu = ({
  value,
  onChange,
}: {
  value: PreviewBreakpoint | null;
  onChange: (value: PreviewBreakpoint | null) => void;
}) => {
  const classes = useStyles();
  const previewBreakpointOptions: {
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
  return (
    <ToggleButtonGroup
      className={classes.toggleButtonGroup}
      color="primary"
      value={value}
      exclusive
    >
      {previewBreakpointOptions.map(({ breakpoint, iconName, title }) => {
        return [
          <Tooltip
            key={`${breakpoint}-tooltip`}
            title={title}
            arrow
            enterDelay={1000}
          >
            <ToggleButton
              className={clsx(classes.toggleButton, {
                [classes.toggleButtonSelected]: value === breakpoint,
              })}
              value={breakpoint}
              onClick={() => onChange(breakpoint)}
            >
              <Icon name={iconName} size={16} />
            </ToggleButton>
          </Tooltip>,
          breakpoint !== "sm" ? (
            <Divider
              key={`${breakpoint}-divider`}
              className={classes.divider}
              orientation="vertical"
              flexItem
            />
          ) : null,
        ];
      })}
    </ToggleButtonGroup>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    width: "100%",
    margin: "0 auto",
  },
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
    borderLeft: `2px solid ${theme.palette.divider} !important`,
    height: 16,
    marginLeft: "-1px !important",
    backgroundColor: theme.palette.divider,
  },
}));
