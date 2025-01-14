import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSession } from "next-auth/react";

import { HEADER_HEIGHT } from "@/components/header-constants";

export const useRootStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: `${HEADER_HEIGHT}px`,
    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    padding: `0 ${theme.spacing(6)}`,
    backgroundColor: theme.palette.muted.main,
  },
  sectionContent: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
  },
  noTooltip: {
    // Disable native tooltip in Safari
    "&::after": {
      content: "''",
      display: "block",
    },
  },
}));

export const useUser = () => {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading" || !session) {
    return null;
  }

  return session.user;
};
