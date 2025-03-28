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
  useEffect,
  useMemo,
} from "react";

import { MaybeTooltip } from "@/components/maybe-tooltip";
import useDisclosure from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";
import SvgIcMinus from "@/icons/components/IcMinus";
import SvgIcPlus from "@/icons/components/IcPlus";
import SvgIcWarningCircle from "@/icons/components/IcWarningCircle";

const useControlSectionStyles = makeStyles<
  Theme,
  { isHighlighted?: boolean; hideTopBorder: boolean }
>((theme) => ({
  controlSection: {
    borderTopColor: theme.palette.divider,
    borderTopWidth: ({ hideTopBorder }) => (hideTopBorder ? 0 : "1px"),
    borderTopStyle: "solid",
    overflowX: "hidden",
    overflowY: "auto",
    flexShrink: 0,
    backgroundColor: ({ isHighlighted }) =>
      isHighlighted ? "primaryLight" : "grey.100",
  },
}));

type SectionTitleStylesProps = {
  disabled?: boolean;
  color?: string;
  sectionOpen: boolean;
  gutterBottom: boolean;
  collapse?: boolean;
};

const useSectionTitleStyles = makeStyles<Theme, SectionTitleStylesProps>(
  (theme) => ({
    root: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      marginBottom: ({ gutterBottom }: SectionTitleStylesProps) =>
        gutterBottom ? 0 : -theme.spacing(2),
      border: "none",
      justifyContent: "flex-start",
      "&:hover": {
        cursor: ({ collapse }: SectionTitleStylesProps) =>
          collapse ? "pointer" : "initial",
        backgroundColor: ({ collapse }: SectionTitleStylesProps) =>
          collapse ? theme.palette.grey[200] : "transparent",

        "& $icon": {
          color: theme.palette.grey[600],
        },
      },
    },
    text: {
      "& > svg:first-of-type": {
        marginRight: theme.spacing(2),
      },
      flexGrow: 1,
      display: "flex",
      alignItems: "center",
      color: ({ disabled, color }: SectionTitleStylesProps) =>
        disabled ? "grey.600" : (color ?? "grey.800"),
    },
    icon: {
      justifySelf: "flex-end",
      color: theme.palette.grey[500],
    },
  })
);

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
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
    collapse?: boolean;
    defaultExpanded?: boolean;
    hideTopBorder?: boolean;
  } & Omit<HTMLProps<HTMLDivElement>, "ref">
>(function ControlSection(
  {
    role,
    children,
    isHighlighted,
    sx,
    collapse = false,
    defaultExpanded = true,
    hideTopBorder = false,
    ...props
  },
  ref
) {
  const classes = useControlSectionStyles({ isHighlighted, hideTopBorder });
  const disclosure = useDisclosure(defaultExpanded);
  const ctx = useMemo(
    () => ({ ...disclosure, collapse }),
    [collapse, disclosure]
  );
  useEffect(() => {
    if (isHighlighted) {
      disclosure.setOpen(true);
    }
  }, [disclosure, isHighlighted]);
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
  // large for specific purposes, e.g. base layer map options
  // default for right panel options
  // none for left panel options
  gap?: "large" | "default" | "none";
  px?: "small" | "default";
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
    padding: ({ px }) =>
      `0 ${theme.spacing(px === "small" ? 2 : 4)} ${theme.spacing(4)}`,
    minWidth: 0,
  },
}));

export const ControlSectionContent = ({
  component = "div",
  role,
  ariaLabelledBy,
  children,
  gap = "default",
  px,
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

type TitleProps = {
  variant: "section" | "subsection";
  color?: string;
  iconName?: IconName;
  titleId?: string;
  disabled?: boolean;
  warnMessage?: string | React.ReactNode;
  children: ReactNode;
  gutterBottom?: boolean;
  sx?: TypographyProps["sx"];
};

const Title = (props: TitleProps) => {
  const {
    variant,
    color,
    iconName,
    titleId,
    disabled,
    warnMessage,
    children,
    gutterBottom = true,
    sx,
  } = props;
  const { setOpen, isOpen, collapse } = useControlSectionContext();
  const classes = useSectionTitleStyles({
    disabled,
    color,
    sectionOpen: isOpen,
    gutterBottom,
    collapse,
  });
  const isSection = variant === "section";

  return (
    <div
      className={classes.root}
      onClick={collapse ? () => setOpen((v) => !v) : undefined}
    >
      <Typography
        variant={isSection ? "h4" : "h5"}
        id={titleId}
        className={classes.text}
        sx={sx}
      >
        {isSection ? null : iconName ? <Icon name={iconName} /> : null}
        {children}
      </Typography>
      {warnMessage && <Warning title={warnMessage} />}
      <span className={classes.icon}>
        {collapse ? (
          isOpen ? (
            <SvgIcMinus width={18} height={18} />
          ) : (
            <SvgIcPlus width={18} height={18} />
          )
        ) : null}
      </span>
    </div>
  );
};

export const SectionTitle = (
  props: Omit<TitleProps, "variant" | "iconName">
) => {
  return <Title variant="section" {...props} />;
};

export const SubsectionTitle = (props: Omit<TitleProps, "variant">) => {
  return <Title variant="subsection" {...props} />;
};

export const ControlSectionSkeleton = ({
  sx,
  showTitle = true,
}: {
  sx?: React.ComponentProps<typeof ControlSection>["sx"];
  showTitle?: boolean;
}) => (
  <ControlSection sx={{ mt: 2, ...sx }}>
    <ControlSectionContent px="small" gap="none">
      {showTitle ? (
        <Typography variant="h1">
          <Skeleton sx={{ bgcolor: "grey.300" }} />
        </Typography>
      ) : null}
      <Skeleton
        sx={{ bgcolor: "grey.300", mt: showTitle ? 0 : 2 }}
        variant="rectangular"
        width="100%"
        height={118}
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
