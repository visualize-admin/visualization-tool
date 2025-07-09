import {
  Box,
  BoxProps,
  Collapse,
  Skeleton,
  Theme,
  Typography,
  TypographyProps,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import {
  ComponentProps,
  createContext,
  forwardRef,
  HTMLProps,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { MaybeTooltip } from "@/components/maybe-tooltip";
import { useDisclosure } from "@/components/use-disclosure";
import { isConfiguring, isLayouting } from "@/configurator/configurator-state";
import { Icon, IconName } from "@/icons";
import { useConfiguratorState } from "@/src";

const useControlSectionStyles = makeStyles<Theme, { hideTopBorder: boolean }>(
  (theme) => ({
    controlSection: {
      borderTopColor: theme.palette.divider,
      borderTopWidth: ({ hideTopBorder }) => (hideTopBorder ? 0 : "1px"),
      borderTopStyle: "solid",
      overflowX: "hidden",
      overflowY: "auto",
      flexShrink: 0,
    },
  })
);

export const useSectionTitleStyles = makeStyles<
  Theme,
  {
    disabled?: boolean;
    sectionOpen: boolean;
    interactive?: boolean;
    warn?: boolean;
  }
>((theme) => ({
  text: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    fontWeight: 700,

    "& > svg:first-of-type": {
      marginRight: theme.spacing(1),
    },
  },
  root: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(4),
    border: "none",
    backgroundColor: ({ warn }) =>
      warn ? theme.palette.orange[50] : "transparent",
    color: ({ disabled, warn }) => {
      if (disabled) {
        return theme.palette.monochrome[300];
      }

      if (warn) {
        return theme.palette.orange.main;
      }

      return theme.palette.monochrome[800];
    },
    WebkitUserSelect: "none",
    transition: "background-color 0.2s ease",

    "&:hover": {
      cursor: ({ interactive }) => (interactive ? "pointer" : "initial"),
      backgroundColor: ({ interactive }) => {
        if (interactive) {
          return theme.palette.cobalt[50];
        }

        return "transparent";
      },

      "& $text": {
        color: ({ disabled }) =>
          disabled
            ? theme.palette.monochrome[300]
            : theme.palette.monochrome[800],
      },
    },
  },
  icon: {
    lineHeight: 0,
    justifySelf: "flex-end",
  },
}));

const ControlSectionContext = createContext({
  open: () => {},
  isOpen: false,
  close: () => {},
  setOpen: (_v: boolean | ((oldV: boolean) => boolean)) => {},
  collapse: true as boolean | undefined,
});

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    sx?: BoxProps["sx"];
    collapse?: boolean;
    defaultExpanded?: boolean;
    hideTopBorder?: boolean;
  } & Omit<HTMLProps<HTMLDivElement>, "ref">
>(function ControlSection(
  {
    role,
    children,
    sx,
    collapse = false,
    defaultExpanded = true,
    hideTopBorder = false,
    ...props
  },
  ref
) {
  const classes = useControlSectionStyles({ hideTopBorder });
  const disclosure = useDisclosure(defaultExpanded);
  const ctx = useMemo(
    () => ({ ...disclosure, collapse }),
    [collapse, disclosure]
  );

  return (
    <ControlSectionContext.Provider value={ctx}>
      <Box
        ref={ref}
        role={role}
        data-testid="controlSection"
        sx={sx}
        {...props}
        className={clsx(classes.controlSection, props.className)}
      >
        {children}
      </Box>
    </ControlSectionContext.Provider>
  );
});

type ControlSectionContentProps = {
  children: ReactNode;
  px?: "default" | "none";
  // large for specific purposes, e.g. base layer map options
  // default for right panel options
  // none for left panel options
  gap?: "large" | "default" | "none";
} & Omit<BoxProps, "children">;

const useControlSectionContentStyles = makeStyles<
  Theme,
  Pick<ControlSectionContentProps, "gap" | "px">
>((theme) => ({
  controlSectionContent: {
    display: "flex",
    flexDirection: "column",
    gap: ({ gap }) =>
      theme.spacing(gap === "large" ? 3 : gap === "default" ? 2 : 0),
    minWidth: 0,
    paddingLeft: ({ px }) => (px === "none" ? 0 : theme.spacing(4)),
    paddingTop: theme.spacing(2),
    paddingRight: ({ px }) => (px === "none" ? 0 : theme.spacing(4)),
    paddingBottom: theme.spacing(4),
  },
}));

export const ControlSectionContent = ({
  component = "div",
  role,
  children,
  px = "default",
  gap = "default",
  sx,
  ...props
}: ControlSectionContentProps) => {
  const classes = useControlSectionContentStyles({ gap, px });
  const disclosure = useControlSectionContext();

  return (
    <Collapse in={disclosure.isOpen}>
      <Box
        component={component}
        role={role}
        {...props}
        className={classes.controlSectionContent}
        sx={sx}
      >
        {children}
      </Box>
    </Collapse>
  );
};

export const useControlSectionContext = () => useContext(ControlSectionContext);

export const SectionTitle = ({
  children,
  closable,
  id,
  disabled,
  iconName,
  warnMessage,
  sx,
}: {
  children: ReactNode;
  closable?: boolean;
  id?: string;
  disabled?: boolean;
  iconName?: IconName;
  warnMessage?: string | ReactNode;
  sx?: TypographyProps["sx"];
}) => {
  const [state, dispatch] = useConfiguratorState();
  const handleClick = useEventCallback(() => {
    if (collapse) {
      return setOpen((d) => !d);
    }

    if (!closable) {
      return;
    }

    if (isConfiguring(state)) {
      return dispatch({
        type: "CHART_ACTIVE_FIELD_CHANGED",
        value: undefined,
      });
    }

    if (isLayouting(state)) {
      return dispatch({
        type: "LAYOUT_ACTIVE_FIELD_CHANGED",
        value: undefined,
      });
    }
  });

  const { setOpen, isOpen, collapse } = useControlSectionContext();
  const classes = useSectionTitleStyles({
    disabled,
    sectionOpen: isOpen,
    interactive: !!collapse || !!closable,
    warn: !!warnMessage,
  });

  return (
    <Box
      aria-label={closable ? "Back to main" : undefined}
      component={closable || collapse ? "button" : "div"}
      className={classes.root}
      onClick={handleClick}
    >
      <Typography variant="h6" id={id} className={classes.text} sx={sx}>
        {closable ? (
          <Icon name="chevronLeft" />
        ) : iconName ? (
          <Icon name={iconName} />
        ) : null}
        {children}
      </Typography>
      {warnMessage && <Warning title={warnMessage} />}
      <span className={classes.icon}>
        {collapse ? <Icon name={isOpen ? "minus" : "plus"} /> : null}
      </span>
    </Box>
  );
};

export const ControlSectionSkeleton = ({
  sx,
  showTitle = true,
}: {
  sx?: ComponentProps<typeof ControlSection>["sx"];
  showTitle?: boolean;
}) => (
  <ControlSection sx={{ mt: 2, ...sx }}>
    <ControlSectionContent gap="none">
      {showTitle ? (
        <Typography variant="h1">
          <Skeleton sx={{ bgcolor: "cobalt.50" }} />
        </Typography>
      ) : null}
      <Skeleton
        variant="rectangular"
        sx={{
          width: "100%",
          height: 120,
          mt: showTitle ? 0 : 2,
          bgcolor: "cobalt.50",
        }}
      />
    </ControlSectionContent>
  </ControlSection>
);

const Warning = ({ title }: { title: string | ReactNode }) => {
  return (
    <MaybeTooltip title={title}>
      <Typography sx={{ mr: 2, lineHeight: "0 !important" }}>
        <Icon name="warningCircle" />
      </Typography>
    </MaybeTooltip>
  );
};
