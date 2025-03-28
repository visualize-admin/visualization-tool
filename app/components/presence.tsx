import { Box, Card } from "@mui/material";
import { motion, Transition } from "framer-motion";

export const MotionBox = motion(Box);
export const MotionCard = motion(Card) as typeof Card;

export const DURATION = 0.4;

export const smoothPresenceProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: DURATION,
  },
};

export const accordionPresenceProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scaleY: 0 },
  transition: {
    duration: DURATION,
  },
};

export const navPresenceProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: DURATION,
  },
};

export const __BANNER_MARGIN_CSS_VAR = "--banner-margin";
export const BANNER_MARGIN_CSS_VAR = `var(${__BANNER_MARGIN_CSS_VAR}, -420px)`;

export const bannerPresenceProps: Transition = {
  transition: {
    duration: DURATION,
  },
  initial: {
    marginTop: BANNER_MARGIN_CSS_VAR,
  },
  animate: {
    marginTop: 0,
  },
  exit: {
    marginTop: BANNER_MARGIN_CSS_VAR,
  },
};
