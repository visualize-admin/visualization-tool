import { Box, Card } from "theme-ui";
import { motion } from "framer-motion";

export const MotionBox = motion(Box);
export const MotionCard = motion(Card);

export const smoothPresenceProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const navPresenceProps = {
  variants: {
    enter: () => ({
      opacity: 0,
      x: 20,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.4,
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
};
