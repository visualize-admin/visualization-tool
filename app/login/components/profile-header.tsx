import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { User } from "@prisma/client";
import clsx from "clsx";
import NextLink from "next/link";
import { signOut } from "next-auth/react";

import { ADFS_PROFILE_URL } from "@/domain/env";
import { useRootStyles } from "@/login/utils";
import { Icon } from "@/icons";

const useStyles = makeStyles<Theme>((theme) => ({
  section: {
    paddingTop: theme.spacing(6),
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  button: {
    width: "fit-content",
  },
}));

export const ProfileHeader = (props: { user: User }) => {
  const { user } = props;
  const rootClasses = useRootStyles();
  const classes = useStyles();
  return (
    <Box className={clsx(rootClasses.section, classes.section)}>
      <Box className={rootClasses.sectionContent}>
        <Box className={classes.topRow}>
          <Typography variant="h1" sx={{ fontWeight: 700 }}>
            {user.name}
          </Typography>
          <BrowseButton />
        </Box>
        {ADFS_PROFILE_URL && (
          <Button
            className={classes.button}
            component="a"
            href={ADFS_PROFILE_URL}
            variant="text"
            color="blue"
            size="sm"
            sx={{ mr: 2 }}
          >
            eIAM MyAccount
          </Button>
        )}
        <Button
          className={classes.button}
          variant="text"
          color="blue"
          size="sm"
          onClick={async () => await signOut()}
        >
          <Trans id="login.sign-out">Sign out</Trans>
        </Button>
      </Box>
    </Box>
  );
};

const BrowseButton = () => {
  return (
    <NextLink href="/browse" passHref legacyBehavior>
      <Button size="sm" endIcon={<Icon name="arrowRight" size={20} />}>
        <Trans id="browse.dataset.all">Browse all datasets</Trans>
      </Button>
    </NextLink>
  );
};
