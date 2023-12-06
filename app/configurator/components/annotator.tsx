import { Trans } from "@lingui/macro";
import { Theme, Typography, TypographyProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

const useStyles = makeStyles<Theme, { hoverable?: boolean }>({
  text: {
    marginBottom: 4,
    cursor: "pointer",

    "&:hover": {
      textDecoration: ({ hoverable }) => (hoverable ? "underline" : "none"),
    },
  },
});

const getEmptyColor = (lighterColor?: boolean) => {
  return lighterColor ? "grey.500" : "secondary.main";
};

type Props = TypographyProps & {
  text: string;
  lighterColor?: boolean;
};

export const Title = (props: Props) => {
  const { text, lighterColor, onClick, className, sx, ...rest } = props;
  const classes = useStyles({ hoverable: !!onClick });

  return (
    <Typography
      {...rest}
      variant="h2"
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{ color: text === "" ? getEmptyColor(lighterColor) : "text", ...sx }}
    >
      {text === "" ? <Trans id="annotation.add.title">[ Title ]</Trans> : text}
    </Typography>
  );
};

export const Description = (props: Props) => {
  const { text, lighterColor, onClick, className, sx, ...rest } = props;
  const classes = useStyles({ hoverable: !!onClick });

  return (
    <Typography
      {...rest}
      variant="body1"
      className={clsx(classes.text, className)}
      onClick={onClick}
      sx={{ color: text === "" ? getEmptyColor(lighterColor) : "text", ...sx }}
    >
      {text === "" ? (
        <Trans id="annotation.add.description">[ Description ]</Trans>
      ) : (
        text
      )}
    </Typography>
  );
};
