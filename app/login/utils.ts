import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSession } from "next-auth/react";

import { HEADER_HEIGHT } from "@/components/header";

export const useRootStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: `${HEADER_HEIGHT}px`,
    backgroundColor: theme.palette.muted.main,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    padding: `0 ${theme.spacing(6)}`,
  },
  sectionContent: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
  },
}));

export const useUser = () => {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading" || !session) {
    return null;
  }

  return session.user;
};
