import { t } from "@lingui/macro";
import { Link, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { visuallyHidden } from "@mui/utils";

export const MAIN_CONTENT_ID = "main";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    ...visuallyHidden,

    "&:focus": {
      position: "static",
      alignSelf: "flex-start",
      width: "auto",
      height: "auto",
      margin: theme.spacing(2),
      padding: theme.spacing(1, 2),
      overflow: "visible",
      clip: "auto",
      whiteSpace: "normal",
      ...theme.typography.body2,
    },
  },
}));

export const SkipLink = () => {
  const classes = useStyles();

  return (
    <Link href={`#${MAIN_CONTENT_ID}`} className={classes.root}>
      {t({ id: "skip-link.main-content", message: "Skip to main content" })}
    </Link>
  );
};
