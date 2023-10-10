import { Box, Card } from "@mui/material";
import { Transition, motion } from "framer-motion";

export const MotionBox = motion(Box);
export const MotionCard = motion(Card);

const DURATION = 0.4;

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
  variants: {
    enter: () => ({
      opacity: 0,
      x: 20,
      transition: {
        when: "beforeChildren",
        staggerChildren: DURATION,
      },
    }),
    center: () => ({ opacity: 1, x: 0 }),
    exit: () => ({
      opacity: 0,
    }),
  },
  initial: "enter",
  animate: "center",
  exit: "exit",
  transition: {
    duration: DURATION,
  },
};

export const BANNER_HEIGHT = 250;
export const BANNER_MARGIN_TOP = 96;
export const bannerPresenceProps: Transition = {
  initial: { marginTop: -(BANNER_HEIGHT + BANNER_MARGIN_TOP) },
  animate: { marginTop: BANNER_MARGIN_TOP },
  exit: { marginTop: -(BANNER_HEIGHT + BANNER_MARGIN_TOP) },
  transition: {
    duration: DURATION,
  },
};
