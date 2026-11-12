import { t } from "@lingui/macro";
import { Link, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

export const MAIN_CONTENT_ID = "main";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: theme.zIndex.tooltip + 1,
    padding: theme.spacing(2, 4),
    backgroundColor: theme.palette.background.paper,
    ...theme.typography.body2,
    transform: "translateY(-200%)",

    "&:focus": {
      transform: "none",
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
