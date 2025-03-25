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
import { ReactNode, useMemo, useState } from "react";

import { FREE_CANVAS_BREAKPOINTS } from "@/components/react-grid";
import { Icon, IconName } from "@/icons";
import { theme } from "@/themes/federal";

type PreviewBreakpoint = keyof typeof FREE_CANVAS_BREAKPOINTS;

export const usePreviewBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<PreviewBreakpoint | null>(null);
  return {
    previewBreakpoint: breakpoint,
    setPreviewBreakpoint: setBreakpoint,
  };
};

export const PreviewContainer = ({
  children,
  breakpoint,
  singleColumn,
}: {
  children: ReactNode;
  breakpoint: PreviewBreakpoint | null;
  singleColumn?: boolean;
}) => {
  const classes = useStyles();
  const { breakpoints } = useTheme();
  const width = useMemo(() => {
    if (breakpoint) {
      switch (breakpoint) {
        case "xl":
          return breakpoints.values.lg - 1;
        case "lg":
          return breakpoints.values.md - 1;
        case "md":
          return breakpoints.values.sm - 1;
        case "sm":
          return FREE_CANVAS_BREAKPOINTS.md;
        default:
          const _exhaustiveCheck: never = breakpoint;
          return _exhaustiveCheck;
      }
    }
    return singleColumn ? theme.breakpoints.values.lg - 1 : "100%";
  }, [breakpoint, breakpoints, singleColumn]);
  return (
    <div className={classes.container}>
      <div
        className={classes.chartContainer}
        style={{ width, paddingTop: breakpoint ? "0.5rem" : 0 }}
      >
        {children}
      </div>
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
      breakpoint: "xl",
      iconName: "desktop",
      title: t({
        id: "controls.layout.preview-xl",
        message: "Preview using extra large width",
      }),
    },
    {
      breakpoint: "lg",
      iconName: "laptop",
      title: t({
        id: "controls.layout.preview-lg",
        message: "Preview using large width",
      }),
    },
    {
      breakpoint: "md",
      iconName: "tablet",
      title: t({
        id: "controls.layout.preview-md",
        message: "Preview using medium width",
      }),
    },
    {
      breakpoint: "sm",
      iconName: "mobile",
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
    height: "calc(100% - 2rem)",
    overflowY: "auto",
    padding: theme.spacing(6, 0, 6, 6),
  },
  chartContainer: {
    margin: "0 auto",
    paddingBottom: "2rem",
    paddingRight: theme.spacing(6),
  },
  toggleButtonGroup: {
    marginLeft: "auto",
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
