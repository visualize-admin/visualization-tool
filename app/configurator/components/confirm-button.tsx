import { Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

export const ConfirmButton = ({ onClick }: { onClick: () => void }) => {
  const classes = useStyles();

  return (
    <Button className={classes.root} size="sm" onClick={onClick}>
      <Typography component="span">Ok</Typography>
    </Button>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    alignSelf: "flex-end",
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
}));
