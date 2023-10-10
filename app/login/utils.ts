import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

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
