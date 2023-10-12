import { Trans } from "@lingui/macro";
import { Box, Button, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { User } from "@prisma/client";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import NextLink from "next/link";

import { useRootStyles } from "@/login/utils";

const useStyles = makeStyles<Theme>((theme) => ({
  section: {
    paddingTop: theme.spacing(6),
    backgroundColor: theme.palette.muted.main,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  browseButton: {
    width: "fit-content",
  },
}));

type ProfileHeaderProps = {
  user: User;
};

export const ProfileHeader = (props: ProfileHeaderProps) => {
  const { user } = props;
  const rootClasses = useRootStyles();
  const classes = useStyles();

  return (
    <Box className={clsx(rootClasses.section, classes.section)}>
      <Box className={rootClasses.sectionContent}>
        <Box className={classes.topRow}>
          <Typography variant="h1">{user.name}</Typography>
          <BrowseButton />
        </Box>
        <Button
          className={classes.browseButton}
          variant="text"
          color="primary"
          size="small"
          onClick={async () => await signOut()}
        >
          Log out
        </Button>
      </Box>
    </Box>
  );
};

const BrowseButton = () => {
  return (
    <Button>
      <NextLink href="/browse" passHref legacyBehavior>
        <Link
          sx={{
            "&:hover": {
              textDecoration: "none",
            },
          }}
        >
          <Trans id="browse.dataset.all">Browse all datasets</Trans>
        </Link>
      </NextLink>
    </Button>
  );
};
