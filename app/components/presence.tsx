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
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: {
    duration: DURATION,
  },
};

export const BANNER_HEIGHT = 250;
export const BANNER_MARGIN_TOP = 61;
export const bannerPresenceProps: Transition = {
  initial: { marginTop: -(BANNER_HEIGHT + BANNER_MARGIN_TOP) },
  animate: { marginTop: BANNER_MARGIN_TOP },
  exit: { marginTop: -(BANNER_HEIGHT + BANNER_MARGIN_TOP) },
  transition: {
    duration: DURATION,
  },
};
