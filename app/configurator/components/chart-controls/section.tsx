import {
  Box,
  BoxProps,
  Collapse,
  Skeleton,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, {
  createContext,
  ElementType,
  forwardRef,
  HTMLProps,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { MaybeTooltip } from "@/components/maybe-tooltip";
import useDisclosure from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";
import SvgIcWarningCircle from "@/icons/components/IcWarningCircle";

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

const useSectionTitleStyles = makeStyles<
  Theme,
  { disabled?: boolean; sectionOpen: boolean; collapse?: boolean }
>((theme) => ({
  root: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(4),
    border: "none",
    WebkitUserSelect: "none",
    transition: "background-color 0.2s ease",

    "&:hover": {
      cursor: ({ collapse }) => (collapse ? "pointer" : "initial"),
      backgroundColor: ({ collapse }) =>
        collapse ? theme.palette.cobalt[50] : "transparent",
    },
  },
  text: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
    color: ({ disabled }) => (disabled ? "monochrome.300" : "monochrome.800"),

    "& > svg:first-of-type": {
      marginRight: theme.spacing(2),
    },
  },
  icon: {
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
  component?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  px?: "default" | "none";
  // large for specific purposes, e.g. base layer map options
  // default for right panel options
  // none for left panel options
  gap?: "large" | "default" | "none";
  sx?: BoxProps["sx"];
} & BoxProps;

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
  ariaLabelledBy,
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
        aria-labelledby={ariaLabelledBy}
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
  id,
  disabled,
  iconName,
  warnMessage,
  sx,
}: {
  children: ReactNode;
  id?: string;
  disabled?: boolean;
  iconName?: IconName;
  warnMessage?: string | ReactNode;
  sx?: TypographyProps["sx"];
}) => {
  const { setOpen, isOpen, collapse } = useControlSectionContext();
  const classes = useSectionTitleStyles({
    disabled,
    sectionOpen: isOpen,
    collapse,
  });

  return (
    <Box
      className={classes.root}
      onClick={collapse ? () => setOpen((v) => !v) : undefined}
    >
      <Typography variant="h6" id={id} className={classes.text} sx={sx}>
        {iconName ? <Icon name={iconName} /> : null}
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
  sx?: React.ComponentProps<typeof ControlSection>["sx"];
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

type WarningProps = {
  title: string | React.ReactNode;
};

const Warning = (props: WarningProps) => {
  const { title } = props;

  return (
    <MaybeTooltip title={title}>
      <Typography color="warning.main" sx={{ mr: 2 }}>
        <SvgIcWarningCircle width={18} height={18} />
      </Typography>
    </MaybeTooltip>
  );
};
