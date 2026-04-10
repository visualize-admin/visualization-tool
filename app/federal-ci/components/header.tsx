import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

import {
  Box,
  BoxProps,
  Breakpoint,
  ButtonProps,
  Divider,
  SxProps,
  Typography,
  useEventCallback,
} from "@mui/material";
import NextLink from "next/link";

import { ContentWrapper } from "@/federal-ci/components/content-wrapper";
import { ResponsiveLogo } from "@/federal-ci/components/logo";
import { MobileSections } from "@/federal-ci/components/mobile-menu";
import { Button, Link } from "@/federal-ci/foundations";
import { MenuIcon } from "@/federal-ci/icons";
import { b, c, s, t } from "@/federal-ci/theme";
import { makeStyles } from "@/federal-ci/utils/make-styles";
import {
  Section,
  UniversalSection,
  isNotMobileSection,
} from "@/federal-ci/utils/menu-sections";
import { maybeWindow } from "@/utils/maybe-window";

const useStyles = makeStyles()({
  root: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    width: "100%",
    minHeight: s(12),
    paddingTop: s(1),
    paddingBottom: s(1),
    [b.only("xxs" as any)]: {
      minHeight: "64px",
    },
    [b.only("xs")]: {
      minHeight: "65px",
    },
    [b.only("sm")]: {
      minHeight: "90px",
    },
    [b.only("md")]: {
      minHeight: "90px",
      py: s(2),
    },
    [b.only("lg")]: {
      minHeight: s(25),
      py: s(3),
    },
    [b.up("xl")]: {
      minHeight: s(40),
      py: s(3),
    },
    borderBottom: `1px solid ${c.monochrome[300]}`,
  },

  contentWrapper: {
    [b.up("lg")]: {
      alignItems: "flex-start",
    },
    [b.down("lg")]: {
      justifyContent: "space-between",
    },
    gap: s(10),
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    [b.up("sm")]: {
      alignItems: "flex-start",
    },
    gap: s(2),
    [b.only("sm")]: {
      gap: s(3),
    },
    [b.only("md")]: {
      gap: s(4),
    },
    [b.only("lg")]: {
      gap: s(5),
    },
    [b.up("xl")]: {
      gap: s(6),
    },
    width: "fit-content",
  },

  desktopSection: {
    display: "none",
    [b.up("lg")]: {
      display: "flex",
      flexWrap: "wrap",
    },
    rowGap: s(2),
    columnGap: s(6),
  },

  headerTitle: {
    maxWidth: 350,
    color: c.text.primary,
    lineHeight: 1.375,
    "&&": {
      fontWeight: "bold",
    },
  },
});

const OpenMobileMenuButton = ({
  onClick,
  ...props
}: {
  onClick: (ev: MouseEvent<HTMLButtonElement>) => void;
} & ButtonProps) => (
  <Button
    {...props}
    sx={{
      display: "none",
      [b.down("lg")]: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "40px",
        "&:hover": { backgroundColor: c.cobalt[50] },
      },
      ...props.sx,
    }}
    onClick={onClick}
  >
    <MenuIcon size={40} />
  </Button>
);

const useMobileMenuOpen = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const hasOpened = useRef(false);

  // Disable body scrolling when the menu is open.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      hasOpened.current = true;
      // Only scroll to the top when the menu was previously opened (to remove
      // automatic scrolling when the page is first loaded).
    } else if (hasOpened.current) {
      document.body.style.overflow = "auto";
      maybeWindow()?.scroll({ top: scrollTop, behavior: "smooth" });
    }
  }, [isMenuOpen]);
  return { isMenuOpen, setScrollTop, setIsMenuOpen };
};

type HeaderProps = {
  /** router.asPath */
  asPath: string;
  shortTitle: string;
  longTitle: string;
  rootHref: string;
  titleHref?: string;
  /** Used in mobile, expandable subsections. */
  goBackLabel?: string;
  closeLabel?: string;
  openLabel?: string;
  sections?: Section[];
  ContentWrapperProps?: {
    sx?: SxProps;
  };
};

export const BaseHeader = (props: HeaderProps & BoxProps) => {
  const { classes, cx } = useStyles();
  const {
    asPath,
    shortTitle,
    longTitle,
    rootHref,
    titleHref,
    goBackLabel = "Go back",
    closeLabel = "Close Menu",
    openLabel = "Open Menu",
    sections,
    ContentWrapperProps,
    ...rest
  } = props;

  const { isMenuOpen, setScrollTop, setIsMenuOpen } = useMobileMenuOpen();
  const onClickMobileMenu = useEventCallback(() => {
    const window = maybeWindow();
    if (window) {
      setScrollTop(window.scrollY);
    }

    const header = document.getElementById("federal-header");
    header?.scrollIntoView({ behavior: "smooth" });

    setIsMenuOpen(true);
  });

  return (
    <Box
      id="federal-header"
      {...rest}
      className={cx(classes.root, rest.className)}
    >
      <ContentWrapper
        className={classes.contentWrapper}
        sx={ContentWrapperProps?.sx}
      >
        {!isMenuOpen && (
          <Box className={classes.logoContainer}>
            <NextLink href={rootHref} legacyBehavior passHref>
              <Link sx={{ minWidth: "fit-content" }}>
                <ResponsiveLogo />
              </Link>
            </NextLink>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                [b.only("xxs" as Breakpoint)]: {
                  minHeight: 34,
                },
                [b.between("xs" as Breakpoint, "md")]: {
                  minHeight: 40,
                },
                [b.between("md", "xl")]: {
                  minHeight: 56,
                },
                [b.between("xl", "xxxl" as Breakpoint)]: {
                  minHeight: 64,
                },
                [b.only("xxxl" as Breakpoint)]: {
                  minHeight: 70,
                },
                backgroundColor: c.monochrome[300],
              }}
            />

            <NextLink passHref href={titleHref ?? rootHref} legacyBehavior>
              <Link sx={{ minWidth: "fit-content" }}>
                <HeaderTitle
                  title={shortTitle}
                  sx={{ display: ["block", "none"] }}
                />
                <HeaderTitle
                  title={longTitle}
                  sx={{ display: ["none", "block"] }}
                />
              </Link>
            </NextLink>
          </Box>
        )}

        {sections && sections.length > 0 && (
          <>
            {!isMenuOpen && (
              <OpenMobileMenuButton
                aria-label={openLabel}
                onClick={onClickMobileMenu}
              />
            )}
            <DesktopSections sections={sections.filter(isNotMobileSection)} />
          </>
        )}
      </ContentWrapper>
      {sections && sections.length ? (
        <MobileSections
          asPath={asPath}
          sections={sections}
          goBackLabel={goBackLabel}
          closeLabel={closeLabel}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      ) : null}
    </Box>
  );
};

/** Section that appears on both desktop and mobile views. */
type DesktopSectionsProps = {
  sections: UniversalSection[];
};

const DesktopSections = (props: DesktopSectionsProps) => {
  const { classes } = useStyles();
  const { sections } = props;

  return (
    <Box className={classes.desktopSection}>
      {sections.map(({ title, href }) => (
        <NextLink key={title + href} href={href} legacyBehavior passHref>
          <Link sx={{ bg: "transparent" }}>
            <Typography sx={{ typography: t.h5 }}>{title}</Typography>
          </Link>
        </NextLink>
      ))}
    </Box>
  );
};

type HeaderTitleProps = {
  title: string | ReactNode;
  sx?: SxProps;
};

const HeaderTitle = (props: HeaderTitleProps) => {
  const { classes } = useStyles();
  const { title, sx } = props;

  return (
    <Typography
      className={classes.headerTitle}
      sx={{
        [b.only("xs")]: t.h5,
        [b.only("sm")]: t.h6,
        [b.only("md")]: t.h5,
        [b.only("lg")]: t.h5,
        [b.only("xl")]: t.h5,
        [b.only("xxl" as Breakpoint)]: t.h5,
        [b.only("xxxl" as Breakpoint)]: t.h4,
        ...sx,
      }}
    >
      {title}
    </Typography>
  );
};
