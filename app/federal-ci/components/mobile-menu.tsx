import {
  Box,
  Collapse,
  Fade,
  Modal,
  Slide,
  SxProps,
  Typography,
  useMediaQuery,
} from "@mui/material";
import NextLink from "next/link";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SwitchTransition } from "react-transition-group";


import { TRANSITION_DURATION } from "@/federal-ci/components/common";
import { Button, Link } from "@/federal-ci/foundations";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/federal-ci/icons";
import { b, c, s, t } from "@/federal-ci/theme";
import { makeStyles } from "@/federal-ci/utils/make-styles";
import {
  isSectionWithSubsections,
  Section,
  SectionWithSubsections,
} from "@/federal-ci/utils/menu-sections";
import { stripQueryParams } from "@/federal-ci/utils/routing";

const useMobileMenuStyles = makeStyles<
  void,
  "active" | "menuOpen" | "highlighted" | "hasExpandedSection"
>()((_theme, _params, classes) => ({
  active: {},
  menuOpen: {},
  highlighted: {},
  hasExpandedSection: {},

  menuCollapse: {
    zIndex: 2,
    position: "absolute",
    top: 0,
    left: 0,
    borderTop: `1px solid ${c.monochrome[300]}`,
  },

  firstRow: {
    height: "64px",
    [b.only("lg")]: {
      height: s(25),
    },
    [b.up("xl")]: {
      height: s(40),
    },
    background: "white",
    borderBottom: "1px solid",
    borderBottomColor: c.monochrome[300],
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    display: "flex",
  },

  sectionButton: {
    justifyContent: "center",
    minWidth: 64,
    height: "100%",
    color: c.text.primary,
    "&:focus": {
      backgroundColor: c.cobalt[50],
    },
  },

  goBack: {
    gap: s(1),
    paddingLeft: s(1),
    paddingRight: s(3),
    color: c.text.primary,
    "&:focus": {
      backgroundColor: c.cobalt[50],
    },
  },

  close: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "40px",
    marginRight: s(1),
    paddingLeft: 0,
    [`.${classes.menuOpen} &`]: {
      paddingLeft: s(2.5),
    },
    "&:focus": {
      backgroundColor: c.cobalt[50],
    },
  },

  expandButton: {
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: `calc(${s(3)} + 6px)`,
    paddingRight: s(5),
    borderLeft: `2px solid transparent`,
    [`&.${classes.active}`]: {
      borderLeft: `2px solid ${c.border.active}`,
    },
  },

  mobileSections: {
    width: "100%",
    background: c.background.paper,
    display: "block",
    [b.up("lg")]: {
      display: "none",
    },
    color: c.text.primary,
  },

  mobileMenuChildren: {
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: `calc(100vh - ${s(12)})`,
    [b.only("sm")]: {
      height: `calc(100vh - ${s(16)})`,
    },
    [b.only("md")]: {
      height: `calc(100vh - ${s(18)})`,
    },
    [b.only("lg")]: {
      height: `calc(100vh - ${s(25)})`,
    },
    [b.up("xl")]: {
      height: `calc(100vh - ${s(40)})`,
    },
    background: c.background.paper,
  },

  mobileSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: s(16),
    minHeight: s(12),
    borderBottom: `1px solid ${c.monochrome[300]}`,
    "&:last-child": {
      // Make sure two last elements are clickable on mobile browsers that have
      // a bottom toolbar.
      marginBottom: s(32),
    },
  },

  mobileSectionLink: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingLeft: `calc(${s(3)} + 3px)`,
    paddingRight: s(3),

    borderLeft: `2px solid transparent`,
    backgroundColor: "transparent",

    [`.${classes.active} &`]: {
      borderLeft: `2px solid ${c.border.active}`,
    },

    [`.${classes.highlighted}`]: {
      backgroundColor: c.cobalt[50],
    },

    "&:focus": {
      backgroundColor: c.cobalt[50],
      color: "inherit",
    },
    "&:hover": {
      color: "inherit",
    },
  },
}));

type SectionButtonProps = PropsWithChildren<{
  onClick: () => void;
  sx?: SxProps;
  className?: string;
}>;

const SectionButton = (props: SectionButtonProps) => {
  const { classes, cx } = useMobileMenuStyles();
  const { onClick, sx, children, className } = props;

  return (
    <Button
      onClick={onClick}
      className={cx(classes.sectionButton, className)}
      sx={sx}
    >
      {children}
    </Button>
  );
};

type MobileSectionsProps = {
  /** router.asPath */
  asPath: string;
  sections: Section[];
  goBackLabel: string;
  closeLabel: string;
  setIsMenuOpen: (isOpen: boolean) => void;
  isMenuOpen: boolean;
};

export const MobileSections = (props: MobileSectionsProps) => {
  const { classes, cx } = useMobileMenuStyles();
  const {
    asPath,
    sections,
    goBackLabel,
    closeLabel,
    isMenuOpen,
    setIsMenuOpen,
  } = props;
  const [expandedSections, setExpandedSections] = useState<
    SectionWithSubsections[]
  >([]);
  const isDesktop = useMediaQuery(b.up("lg"));

  useEffect(() => {
    if (isDesktop) {
      setIsMenuOpen(false);
      setExpandedSections([]);
    }
  }, [isDesktop]);

  const activeExpandedSection = expandedSections[expandedSections.length - 1];
  const onExpand = useCallback(
    (d: SectionWithSubsections) => {
      setExpandedSections([...expandedSections, d]);
    },
    [expandedSections]
  );
  const cleanURL = stripQueryParams(asPath);

  // Close the menu when the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [asPath]);

  return (
    <Modal
      open={isMenuOpen}
      keepMounted
      onClose={() => setIsMenuOpen(false)}
      closeAfterTransition
    >
      <Collapse
        in={isMenuOpen}
        onExited={() => {
          setExpandedSections([]);
        }}
        timeout={TRANSITION_DURATION}
        className={classes.menuCollapse}
      >
        <Box
          className={cx(
            classes.mobileSections,
            activeExpandedSection ? classes.hasExpandedSection : null,
            isMenuOpen ? classes.menuOpen : null
          )}
          component="nav"
          aria-label="Mobile menu navigation"
        >
          <Box className={classes.firstRow}>
            <Slide direction="right" in={expandedSections.length > 0}>
              <Button
                onClick={() => {
                  setExpandedSections(expandedSections.slice(0, -1));
                }}
                className={classes.goBack}
              >
                <ArrowLeftIcon size={40} />
                <Typography component="span" sx={{ typography: t.body2 }}>
                  {goBackLabel}
                </Typography>
              </Button>
            </Slide>
            <Slide in={isMenuOpen} direction="down">
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  setExpandedSections([]);
                }}
                className={classes.close}
              >
                <>
                  <Typography component="span" sx={{ typography: t.body2 }}>
                    {closeLabel}
                  </Typography>
                  <CloseIcon size={40} />
                </>
              </Button>
            </Slide>
          </Box>
          <SwitchTransition>
            <Fade
              key={
                activeExpandedSection?.href ??
                expandedSections.map((section) => section.title).join("")
              }
            >
              <Box className={classes.mobileMenuChildren}>
                {expandedSections.length > 0 ? (
                  <>
                    <Box sx={{ p: s(4), pb: 0 }}>
                      {activeExpandedSection.href ? (
                        <NextLink
                          href={activeExpandedSection.href}
                          legacyBehavior
                          passHref
                        >
                          <Link>
                            <MobileSectionTitle
                              title={activeExpandedSection.title}
                            />
                          </Link>
                        </NextLink>
                      ) : (
                        <MobileSectionTitle
                          title={activeExpandedSection.title}
                        />
                      )}
                    </Box>
                    <Box sx={{ boxSizing: "border-box", mt: s(3) }}>
                      {activeExpandedSection.sections.map((d, i) => {
                        const active =
                          d.active ??
                          isActive({ ...d, mobileOnly: true }, cleanURL);
                        return (
                          <MobileSection
                            key={`${i}-${d.href}`}
                            {...d}
                            onExpand={onExpand}
                            active={active}
                          />
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  sections.map((d, i) => {
                    const active = d.active ?? isActive(d, cleanURL);
                    return (
                      <MobileSection
                        key={`${i}-${d.href}`}
                        {...d}
                        onExpand={onExpand}
                        active={active}
                      />
                    );
                  })
                )}
              </Box>
            </Fade>
          </SwitchTransition>
        </Box>
      </Collapse>
    </Modal>
  );
};

type MobileSectionTitleProps = {
  title: string | ReactNode;
};

const MobileSectionTitle = (props: MobileSectionTitleProps) => {
  const { title } = props;

  return <Typography sx={{ mt: s(3), fontWeight: 700 }}>{title}</Typography>;
};

type MobileSectionProps = Section & {
  active: boolean;
  fadedOut?: boolean;
  onExpand: (d: SectionWithSubsections) => void;
};

const MobileSection = (props: MobileSectionProps) => {
  const { classes, cx } = useMobileMenuStyles();
  const { title, href, active, onExpand, isHighlighted, fadedOut } = props;
  const allowExpand = isSectionWithSubsections(props);

  return (
    <Box
      className={cx(
        classes.mobileSection,
        active ? classes.active : null,
        isHighlighted ? classes.highlighted : null
      )}
    >
      {href ? (
        <NextLink href={href} legacyBehavior passHref>
          <Link className={classes.mobileSectionLink}>
            <Typography sx={{ typography: t.h4, opacity: fadedOut ? 0.5 : 1 }}>
              {title}
            </Typography>
          </Link>
        </NextLink>
      ) : (
        allowExpand && (
          <SectionButton
            onClick={() => onExpand(props)}
            className={cx(classes.expandButton, active ? classes.active : null)}
          >
            <Typography sx={{ typography: t.h4, opacity: fadedOut ? 0.5 : 1 }}>
              {title}
            </Typography>
            <ArrowRightIcon size={20} />
          </SectionButton>
        )
      )}

      {href && allowExpand && (
        <SectionButton
          onClick={() => onExpand(props)}
          sx={{ borderLeft: `1px solid ${c.monochrome[300]}` }}
        >
          <ArrowRightIcon size={20} />
        </SectionButton>
      )}
    </Box>
  );
};

const isActive = (section: Section, url: string): boolean => {
  if (section?.href === url) {
    return true;
  } else if (isSectionWithSubsections(section)) {
    return (
      section.sections?.some((d) =>
        isActive({ ...d, mobileOnly: true }, url)
      ) ?? false
    );
  } else {
    return false;
  }
};
